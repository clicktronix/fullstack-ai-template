import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAuthRoute, isProtectedRoute } from '@/lib/auth-routes'
import { DEFAULT_AUTHENTICATED_ROUTE } from '@/lib/constants'

const isDevelopment = process.env.NODE_ENV === 'development'

function withSecurityHeaders(res: NextResponse, req: NextRequest): NextResponse {
  // Build allowed connect-src origins from environment
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
  const sentryIngestDomain = 'https://*.ingest.us.sentry.io'

  // CSP configuration with dev/prod support
  const connectSrc = isDevelopment
    ? // Development: allow localhost connections for HMR and local services
      `connect-src 'self' ${supabaseUrl} ${apiUrl} ${sentryIngestDomain} ws://localhost:* http://localhost:*`
    : // Production: only allow known external services
      `connect-src 'self' ${supabaseUrl} ${apiUrl} ${sentryIngestDomain}`

  const cspDirectives = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: https:",
    // 'unsafe-inline' required for both dev and prod because:
    // - Mantine UI injects inline styles for theming and components
    // - DnD libraries use inline transforms for drag positioning
    // - CSS variables are set via style attributes
    // Pending Mantine support: replace unsafe-inline styles with nonce-based CSP.
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    connectSrc,
    // Next.js requires 'unsafe-inline' for hydration scripts
    // Development: Also needs 'unsafe-eval' for hot reload
    isDevelopment
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'",
  ]

  // Only add upgrade-insecure-requests in production with HTTPS
  if (!isDevelopment && req.nextUrl.protocol === 'https:') {
    cspDirectives.push('upgrade-insecure-requests')
  }

  res.headers.set('Content-Security-Policy', cspDirectives.join('; '))
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

type CookieToSet = {
  name: string
  value: string
  options?: Record<string, unknown>
}

function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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
  req: NextRequest
): NextResponse | undefined {
  if (!requiresApiAuth || isAuthenticated) return undefined
  return withSecurityHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), req)
}

/**
 * Middleware for authentication and security using Supabase Auth.
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
export default async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const isApiRoute = pathname.startsWith('/api')

  // Fast path: Skip auth check for Next.js internals and static files
  if (pathname.startsWith('/_next')) {
    return withSecurityHeaders(NextResponse.next(), req)
  }

  // Create response that we'll modify
  let response = NextResponse.next({ request: req })
  const supabaseConfig = getSupabaseConfig()
  if (!supabaseConfig) {
    return withSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
      req
    )
  }

  // Create Supabase client for middleware
  const supabase = createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        for (const { name, value } of cookiesToSet) {
          req.cookies.set(name, value)
        }
        response = NextResponse.next({ request: req })
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
    rejectUnauthenticatedApiRequest(requiresApiAuth, isAuthenticated, req)

  if (guardResponse) return withSecurityHeaders(guardResponse, req)

  // Add path headers for server components to access (used by protected layout fallback)
  response.headers.set('x-pathname', pathname)
  response.headers.set('x-search', search)

  // Apply security headers and return response with updated cookies
  return withSecurityHeaders(response, req)
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
