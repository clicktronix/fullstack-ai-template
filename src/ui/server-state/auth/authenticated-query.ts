import {
  useQuery,
  type DefaultError,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query'
import { useCurrentUser } from './queries'

/**
 * Wrapper over useQuery that waits for authentication.
 *
 * Prevents "401 storm" when access token expires:
 * - All queries wait until user session is validated on initial load
 * - When 401 occurs, transport layer invalidates user query
 * - All dependent queries automatically pause until new session is ready
 * - After refresh completes, queries resume
 *
 * Why check both isSuccess AND !isLoading (not !isFetching):
 * - isLoading = isPending && isFetching (true only on first load, no cache)
 * - isFetching = true during initial load AND background refetches
 * - Using !isFetching would block ALL queries during window focus refetches
 * - Using !isLoading blocks only on initial auth, background refetches don't block
 *
 * Uses TanStack Query's dependent queries pattern:
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries
 *
 * @example
 * ```ts
 * // Before:
 * useQuery({ queryKey: ['data'], queryFn: fetchData, enabled: !!resourceId })
 *
 * // After:
 * useAuthenticatedQuery({ queryKey: ['data'], queryFn: fetchData, enabled: !!resourceId })
 * ```
 *
 * @remarks
 * Do NOT use this for:
 * - `useCurrentUser` itself (would create circular dependency)
 * - Public endpoints that don't require authentication
 */
export function useAuthenticatedQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>): UseQueryResult<TData, TError> {
  const { isSuccess, isLoading } = useCurrentUser()

  // Auth is ready when:
  // 1. User data exists (isSuccess)
  // 2. Initial load is complete (!isLoading)
  // isLoading = isPending && isFetching (true only on first load without cache)
  // Background refetches (window focus) won't block queries anymore
  const isAuthReady = isSuccess && !isLoading

  return useQuery({
    ...options,
    enabled: isAuthReady && (options.enabled ?? true),
  })
}
