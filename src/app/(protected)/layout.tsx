import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { verifySession } from '@/infrastructure/auth/verify-session'
import { getQueryClient } from '@/lib/query-client'
import { authKeys } from '@/ui/server-state/auth/keys'

// This layout uses `cookies()` via verifySession(), so it must be dynamic.
// Marking it explicitly prevents Next from attempting static rendering during build.
export const dynamic = 'force-dynamic'

/**
 * Protected routes layout with authentication and query hydration.
 *
 * This layout wraps all protected routes (dashboard, profile, portfolio)
 * and ensures user is authenticated before rendering.
 *
 * Architecture:
 * - Middleware: Fast cookie check (optimistic)
 * - This layout: Full session validation via verifySession()
 * - HydrationBoundary: Pre-populates React Query cache with user data
 * - Pages: Access session via React cache (no duplicate API calls)
 *
 * Benefits:
 * - Single verifySession() call per navigation to protected routes
 * - Public routes (/, /login) don't trigger auth checks
 * - Reduces unnecessary /auth/me requests
 * - useCurrentUser() has data immediately (no loading state on client)
 * - All useAuthenticatedQuery hooks see isSuccess=true instantly
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
 */
export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await verifySession()

  if (!session) {
    // Try to preserve the original path for post-login redirect
    // Middleware usually handles this, but this is a fallback
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') ?? headersList.get('x-invoke-path') ?? ''
    const search = headersList.get('x-search') ?? ''
    const fullPath = pathname + search

    if (fullPath && fullPath !== '/') {
      redirect(`/login?redirect=${encodeURIComponent(fullPath)}`)
    } else {
      redirect('/login')
    }
  }

  // Pre-populate React Query cache with user data from SSR
  // This eliminates the need for client-side /auth/me request
  // and ensures useAuthenticatedQuery hooks work immediately
  const queryClient = getQueryClient()
  queryClient.setQueryData(authKeys.user(), session.user)

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
}
