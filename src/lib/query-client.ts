import { QueryClient, isServer } from '@tanstack/react-query'
import { cache } from 'react'
import { isTestEnvironment } from '@/infrastructure/env/runtime'
import { ApiError, isRetryableError } from '@/lib/errors/api-error'

/**
 * Creates a new QueryClient with default configuration
 * Used internally by getQueryClient()
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default refetchOnMount: true — refetch stale data on component mount.
        // With staleTime: 60s, SSR-prefetched data stays fresh and won't refetch.
        // For client-loaded data, re-validates on navigation (after staleTime expires).
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        staleTime: 60 * 1000, // 1 minute default
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
        retry: (failureCount, error) => {
          // Use centralized retry logic from ApiError
          // - Don't retry 4xx client errors (bad request, not found, etc.)
          // - Retry 5xx server errors and network errors
          // - Max 3 retries
          if (!isRetryableError(error)) {
            return false
          }
          return failureCount < 3
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
        // Propagate errors to Error Boundary only for unexpected errors (5xx, network)
        // Keep 4xx errors (not found, forbidden) as query errors for inline handling
        throwOnError: (error) => {
          // Only throw to Error Boundary for server errors and network failures
          if (error instanceof ApiError) {
            const status = error.getStatus()
            // NetworkError has no status (undefined) — should also be thrown to ErrorBoundary
            return status === undefined || status >= 500
          }
          // Network errors (TypeError) should go to Error Boundary
          return error instanceof TypeError
        },
      },
      mutations: {
        retry: 0, // Don't retry mutations by default
      },
    },
  })
}

/**
 * Browser QueryClient singleton
 * IMPORTANT: Only used in browser, never on server
 */
let browserQueryClient: QueryClient | null = null
const getServerQueryClient = cache(makeQueryClient)

/**
 * Get or create QueryClient for Next.js App Router
 *
 * Pattern from TanStack Query docs for App Router:
 * - Server: Reuse one request-scoped client per RSC render via React cache()
 * - Browser: Reuse singleton (prevents recreation during React suspense)
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
 */
export function getQueryClient() {
  if (isServer) {
    if (isTestEnvironment()) {
      return makeQueryClient()
    }

    return getServerQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}
