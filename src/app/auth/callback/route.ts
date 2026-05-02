import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerEnv } from '@/infrastructure/env/server'
import { isAuthRoute } from '@/lib/auth-routes'
import { DEFAULT_AUTHENTICATED_ROUTE } from '@/lib/constants'
import { logger } from '@/lib/logger'

type CookieToSet = {
  name: string
  value: string
  options?: Record<string, unknown>
}

/**
 * OAuth Callback Route Handler (PKCE Flow)
 *
 * This route exchanges the authorization code for a session.
 * After successful exchange, it redirects to the callback page
 * which verifies the session and redirects to the dashboard.
 *
 * Flow:
 * 1. OAuth provider redirects here with ?code=...
 * 2. Exchange code for session using Supabase Auth
 * 3. Redirect to callback page for session verification
 *
 * Reference: https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next')

  // Validate redirect target to prevent open redirect attacks:
  // 1. Must start with '/' (relative path only)
  // 2. Must not start with '//' (protocol-relative URLs)
  // 3. Must not be an auth route (prevent redirect loops)
  const next =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && !isAuthRoute(rawNext)
      ? rawNext
      : DEFAULT_AUTHENTICATED_ROUTE

  if (code) {
    const cookieStore = await cookies()
    const env = getServerEnv()

    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: CookieToSet[]) {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      logger.error('[Auth Callback] Code exchange failed:', { error: error.message })
      return NextResponse.redirect(`${origin}/auth/error?error=exchange_failed`)
    }

    logger.info('[Auth Callback] Code exchange successful, redirecting to:', { next })
    return NextResponse.redirect(`${origin}${next}`)
  }

  // No code provided, redirect to error page
  logger.warn('[Auth Callback] No code provided in callback')
  return NextResponse.redirect(`${origin}/auth/error?error=no_code`)
}
