import type { Session } from '@supabase/supabase-js'
import { useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getCurrentUserAction, getSessionAction } from '@/adapters/inbound/next/server-actions/auth'
import { onAuthStateChange } from '@/adapters/outbound/supabase/auth-events'
import type { User } from '@/domain/user/user'
import { authKeys } from '@/ui/server-state/auth/keys'
import { STALE_TIME } from '@/ui/server-state/constants'

/**
 * Query hook for current Supabase session.
 * Subscribes to auth state changes to keep session in sync.
 *
 * Uses onAuthStateChange to automatically update the query
 * when user signs in/out or token refreshes.
 */
export function useSession(
  options?: Omit<UseQueryOptions<Session | null>, 'queryKey' | 'queryFn'>
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const subscription = onAuthStateChange((event, session) => {
      queryClient.setQueryData(authKeys.session(), session)

      // When user signs out or token refresh fails, clear user cache too.
      // This prevents stale user data from showing after session invalidation.
      if (event === 'SIGNED_OUT') {
        queryClient.setQueryData(authKeys.user(), null)
        queryClient.removeQueries({ queryKey: authKeys.user() })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient])

  return useQuery({
    queryKey: authKeys.session(),
    queryFn: () => getSessionAction(),
    staleTime: STALE_TIME.SESSION,
    ...options,
  })
}

/**
 * Query hook for current user from public.users table.
 * Returns application user data with role and profile info.
 *
 * Auto-refetches on window focus to keep user data fresh.
 */
export function useCurrentUser(
  options?: Omit<UseQueryOptions<User | null>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => getCurrentUserAction(),
    staleTime: STALE_TIME.REFERENCE_DATA,
    retry: (failureCount, error) => {
      // Don't retry auth errors (401/403) - user is simply not logged in
      if (error instanceof Error && error.message.includes('session')) {
        return false
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
    ...options,
  })
}
