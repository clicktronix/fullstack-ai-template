'use client'

import type { Session } from '@supabase/supabase-js'
import { usePathname } from 'next/navigation'
import { createContext, Suspense, use, useMemo, useRef, type ReactNode } from 'react'
import type { User } from '@/domain/user/user'
import { isAuthRoute } from '@/lib/auth-routes'
import { useCurrentUser, useSession } from '@/ui/server-state/auth/queries'

type AuthContextValue = {
  /** Current Supabase session (contains access_token, refresh_token, etc.) */
  session: Session | null
  /** Current user from public.users table (contains role, profile data) */
  user: User | null
  /** True while session or user data is being fetched */
  isLoading: boolean
  /** True if user is authenticated (has valid session and user record) */
  isAuthenticated: boolean
  /** Error from session or user query (null if no error) */
  error: Error | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

type AuthProviderProps = {
  children: ReactNode
  /** Initial user from SSR (for protected routes with prefetched data) */
  user?: User | null
}

type AuthProviderCoreProps = AuthProviderProps & {
  shouldDisableQuery: boolean
}

/**
 * AuthProvider manages authentication state using a hybrid approach:
 * - Initial data from SSR (layout's verifySession)
 * - Client-side updates via React Query (keeps data fresh)
 *
 * Exposes:
 * - session: Supabase session (access_token, etc.)
 * - user: Application user from public.users
 * - isLoading: Combined loading state
 * - isAuthenticated: True if user exists
 * - error: Combined error state
 *
 * Optimization Strategy:
 * - Trust SSR data (no immediate refetch on mount)
 * - Long stale time (5 minutes) - user data doesn't change often
 * - Conditional fetching (disabled on auth routes)
 * - Smart refetch (only on window focus if authenticated)
 */
export function AuthProvider({ children, user: initialUser = null }: AuthProviderProps) {
  return (
    <Suspense
      fallback={
        <AuthProviderCore user={initialUser} shouldDisableQuery>
          {children}
        </AuthProviderCore>
      }
    >
      <PathnameAwareAuthProvider user={initialUser}>{children}</PathnameAwareAuthProvider>
    </Suspense>
  )
}

function PathnameAwareAuthProvider({ children, user: initialUser = null }: AuthProviderProps) {
  const pathname = usePathname()
  const shouldDisableQuery = pathname ? isAuthRoute(pathname) : false

  return (
    <AuthProviderCore user={initialUser} shouldDisableQuery={shouldDisableQuery}>
      {children}
    </AuthProviderCore>
  )
}

function AuthProviderCore({
  children,
  user: initialUser = null,
  shouldDisableQuery,
}: AuthProviderCoreProps) {
  // eslint-disable-next-line react-hooks/purity -- Date.now() in useRef initial value is safe: runs once per mount, not on re-renders
  const initialDataUpdatedAtRef = useRef(initialUser ? Date.now() : undefined)

  // Get session from Supabase Auth
  const {
    data: session,
    isLoading: isSessionLoading,
    error: sessionError,
  } = useSession({
    enabled: !shouldDisableQuery,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
  })

  // Use TanStack Query to keep user data fresh
  const {
    data: currentUser,
    isLoading: isUserLoading,
    error: userError,
  } = useCurrentUser({
    // 1. Use SSR data as initial data (prevents flash of unauthenticated state)
    initialData: initialUser ?? undefined,
    // Mark when initial data was fetched (prevents immediate refetch)
    initialDataUpdatedAt: initialDataUpdatedAtRef.current,

    // 2. Trust SSR data for 5 minutes (reduce unnecessary refetches)
    //    User data doesn't change frequently, so long stale time is fine
    staleTime: 5 * 60 * 1000,

    // 3. Fetch if we're NOT on an auth route and have a session
    //    - Protected routes: SSR provides initialUser, React Query trusts it (staleTime)
    //    - Public routes: fetches user client-side (shows login state in header)
    enabled: !shouldDisableQuery,

    // 4. Don't refetch on mount - trust SSR data
    //    SSR already validated session, no need to validate again immediately
    refetchOnMount: false,

    // 5. Refetch on window focus to keep session fresh
    //    When user switches back to tab
    refetchOnWindowFocus: true,
  })

  // Prefer fresh data from React Query, fallback to SSR data
  const user = currentUser ?? initialUser

  // Combine loading states
  const isLoading = isSessionLoading || isUserLoading

  // Combine errors (prefer session error as it's more critical)
  const error = sessionError ?? userError ?? null

  const value = useMemo(
    () => ({
      session: session ?? null,
      user,
      isLoading,
      isAuthenticated: !!user,
      error,
    }),
    [session, user, isLoading, error]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access authentication context.
 * Must be used within AuthProvider.
 *
 * @returns AuthContextValue with session, user, isLoading, isAuthenticated, error
 * @throws Error if used outside AuthProvider
 *
 * @example
 * ```tsx
 * function ProfileButton() {
 *   const { user, isAuthenticated, isLoading } = useAuth()
 *
 *   if (isLoading) return <Skeleton />
 *   if (!isAuthenticated) return <LoginButton />
 *   return <Avatar src={user?.avatar_url} />
 * }
 * ```
 */
export function useAuth() {
  const context = use(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
