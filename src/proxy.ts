import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getPublicEnv } from '@/infrastructure/env/public'
import { isDevelopmentEnvironment } from '@/infrastructure/env/runtime'
import { resolveInitialLocale } from '@/infrastructure/i18n/locale-detection'
import { isAuthRoute, isProtectedRoute } from '@/lib/auth-routes'
import { DEFAULT_AUTHENTICATED_ROUTE, LOCALE_COOKIE_NAME } from '@/lib/constants'

const isDevelopment = isDevelopmentEnvironment()

function createNonce(): string | null {
  // Next.js nonces only work for fully dynamic server-rendered pages. With
  // Cache Components/PPR, the static shell contains prerendered scripts that
  // cannot receive a request-time nonce. Keep this off until a route is moved
  // out of PPR intentionally.
  return null
}

function buildContentSecurityPolicy(req: NextRequest, nonce: string | null): string {
  const publicEnv = getPublicEnv()
  // Build allowed connect-src origins from environment
  const supabaseUrl = publicEnv.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const apiUrl = publicEnv.NEXT_PUBLIC_API_URL ?? ''
  const sentryIngestDomain = 'https://*.ingest.us.sentry.io'
  const baseConnectSrc = ["connect-src 'self'", supabaseUrl, apiUrl, sentryIngestDomain].filter(
    Boolean
  )

  const connectSrc = isDevelopment
    ? // Development: allow localhost connections for HMR and local services
      // eslint-disable-next-line sonarjs/no-clear-text-protocols -- local HTTP is required for dev server connections.
      [...baseConnectSrc, 'ws://localhost:*', 'http://localhost:*'].join(' ')
    : // Production: only allow known external services
      baseConnectSrc.join(' ')

  const scriptSrc =
    nonce && !isDevelopment
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
      : isDevelopment
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'"
  const styleSrc =
    nonce && !isDevelopment
      ? `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`
      : "style-src 'self' 'unsafe-inline'"

  const cspDirectives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: https:",
    // 'unsafe-inline' required for both dev and prod because:
    // - Mantine UI injects inline styles for theming and components
    // - DnD libraries use inline transforms for drag positioning
    // - CSS variables are set via style attributes
    // Pending CSP hardening: remove style-src unsafe-inline when the remaining
    // inline style dependencies can be nonced or externalized. Mantine/Radix history:
    // https://github.com/mantinedev/mantine/issues/3597
    styleSrc,
    "font-src 'self' data:",
    connectSrc,
    scriptSrc,
  ]

  // Only add upgrade-insecure-requests in production with HTTPS
  if (!isDevelopment && req.nextUrl.protocol === 'https:') {
    cspDirectives.push('upgrade-insecure-requests')
  }

  return cspDirectives.join('; ')
}

function createNextResponseWithRequestHeaders(
  req: NextRequest,
  csp: string,
  nonce: string | null
): NextResponse {
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('Content-Security-Policy', csp)

  if (nonce) {
    requestHeaders.set('x-nonce', nonce)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

function withSecurityHeaders(res: NextResponse, req: NextRequest, csp: string): NextResponse {
  res.headers.set('Content-Security-Policy', csp)
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  res.headers.set('Cross-Origin-Resource-Policy', 'same-origin')

  if (req.nextUrl.protocol === 'https:') {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  return res
}

function withLocaleCookie(res: NextResponse, req: NextRequest): NextResponse {
  const currentLocaleCookie = req.cookies.get(LOCALE_COOKIE_NAME)?.value
  const resolvedLocale = resolveInitialLocale({
    cookieLocale: currentLocaleCookie,
    acceptLanguage: req.headers.get('accept-language'),
  })

  if (currentLocaleCookie === resolvedLocale) return res

  res.cookies.set(LOCALE_COOKIE_NAME, resolvedLocale, {
    path: '/',
    maxAge: 31_536_000,
    sameSite: 'lax',
    secure: !isDevelopment,
  })

  return res
}

function finalizeResponse(res: NextResponse, req: NextRequest, csp: string): NextResponse {
  return withLocaleCookie(withSecurityHeaders(res, req, csp), req)
}

type CookieToSet = {
  name: string
  value: string
  options?: Record<string, unknown>
}

function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const publicEnv = getPublicEnv()
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return { url, anonKey }
}

function redirectAuthenticatedFromAuthPage(
  isAuth: boolean,
  isAuthenticated: boolean,
  reqUrl: string
): NextResponse | undefined {
  if (!isAuth || !isAuthenticated) return undefined
  return NextResponse.redirect(new URL(DEFAULT_AUTHENTICATED_ROUTE, reqUrl))
}

function redirectUnauthenticatedFromProtectedPage(
  isProtected: boolean,
  isAuthenticated: boolean,
  pathname: string,
  search: string,
  reqUrl: string
): NextResponse | undefined {
  if (!isProtected || isAuthenticated) return undefined
  const loginUrl = new URL('/login', reqUrl)
  loginUrl.searchParams.set('redirect', pathname + search)
  return NextResponse.redirect(loginUrl)
}

function rejectUnauthenticatedApiRequest(
  requiresApiAuth: boolean,
  isAuthenticated: boolean,
  req: NextRequest,
  csp: string
): NextResponse | undefined {
  if (!requiresApiAuth || isAuthenticated) return undefined
  return withSecurityHeaders(
    NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    req,
    csp
  )
}

/**
 * Proxy for authentication redirects, session refresh, and security headers using Supabase Auth.
 *
 * Responsibilities:
 * 1. Refresh Supabase session if needed (via getUser() — triggers token refresh)
 * 2. Redirect authenticated users away from auth pages (/login, /register)
 * 3. Redirect unauthenticated users away from protected pages
 * 4. Add security headers to all responses
 *
 * IMPORTANT: Uses getUser() (NOT getClaims()) because getUser() triggers
 * automatic token refresh via __loadSession() → _callRefreshToken().
 * getClaims() only validates JWT locally and NEVER refreshes tokens.
 *
 * Reference: https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const isApiRoute = pathname.startsWith('/api')
  const nonce = createNonce()
  const csp = buildContentSecurityPolicy(req, nonce)

  // Fast path: Skip auth check for Next.js internals and static files
  if (pathname.startsWith('/_next')) {
    return withSecurityHeaders(NextResponse.next(), req, csp)
  }

  // Create response that we'll modify
  let response = createNextResponseWithRequestHeaders(req, csp, nonce)
  const supabaseConfig = getSupabaseConfig()
  if (!supabaseConfig) {
    return withSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
      req,
      csp
    )
  }

  // Create Supabase client for proxy
  const supabase = createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        for (const { name, value } of cookiesToSet) {
          req.cookies.set(name, value)
        }
        response = createNextResponseWithRequestHeaders(req, csp, nonce)
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // Determine route type using centralized helpers
  const isAuth = isAuthRoute(pathname)
  const isProtected = isProtectedRoute(pathname)
  // All API routes require authentication — no public API endpoints exist.
  // If a public API route is needed in the future, add it to an explicit allowlist.
  const requiresApiAuth = isApiRoute

  // Only verify auth for routes that need auth decisions.
  // Public routes don't redirect based on auth, so skip getUser().
  let isAuthenticated = false
  if (isAuth || isProtected || requiresApiAuth) {
    // getUser() validates JWT server-side AND refreshes expired tokens.
    // getClaims() only validates locally and NEVER refreshes tokens.
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    isAuthenticated = !userError && !!user
  }

  const guardResponse =
    redirectAuthenticatedFromAuthPage(isAuth, isAuthenticated, req.url) ??
    redirectUnauthenticatedFromProtectedPage(
      isProtected,
      isAuthenticated,
      pathname,
      search,
      req.url
    ) ??
    rejectUnauthenticatedApiRequest(requiresApiAuth, isAuthenticated, req, csp)

  if (guardResponse) return finalizeResponse(guardResponse, req, csp)

  // Add path headers for server components to access (used by protected layout fallback)
  response.headers.set('x-pathname', pathname)
  response.headers.set('x-search', search)

  // Apply security headers and return response with updated cookies
  return finalizeResponse(response, req, csp)
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|monitoring).*)',
  ],
}
