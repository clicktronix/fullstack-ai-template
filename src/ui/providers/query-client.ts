import { QueryCache, QueryClient, isServer, type Query } from '@tanstack/react-query'
import { cache } from 'react'
import { isTestEnvironment } from '@/infrastructure/env/runtime'
import { ApiError, isRetryableError } from '@/infrastructure/errors/api-error'
import {
  getUserFacingErrorMessage,
  getUserFacingErrorTitle,
} from '@/infrastructure/errors/presentation'
import { captureError } from '@/infrastructure/sentry/capture'
import { notifications } from '@/ui/mantine-notifications'

type QueryMeta = {
  /** Skip the failed-query toast notification. The error is still captured to Sentry. */
  silent?: boolean
} & Record<string, unknown>

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: QueryMeta
  }
}

// A query can re-enter its terminal error state more than once over its lifetime (e.g. a
// background refetch fails again later) — each such occurrence is a distinct, real failure
// and should be reported. What must NOT happen is reporting the *same* terminal failure
// twice: TanStack Query already dispatches the cache's 'error' action (and calls
// QueryCache.onError) exactly once per terminal failure — intermediate retry attempts update
// `query.state.fetchFailureReason`, not `query.state.error`/`errorUpdateCount` — but this map
// is a defensive guard against any duplicate onError invocation for the same failure.
// `errorUpdateCount` (not `errorUpdatedAt`, a Date.now() timestamp) is used as the dedupe key
// because it's a monotonically incrementing counter — safe even when two terminal failures
// for the same query land in the same millisecond.
const lastReportedErrorCount = new Map<string, number>()

export function shouldReportQueryError(query: Query<unknown, unknown, unknown>): boolean {
  const { errorUpdateCount } = query.state
  if (lastReportedErrorCount.get(query.queryHash) === errorUpdateCount) {
    return false
  }
  lastReportedErrorCount.set(query.queryHash, errorUpdateCount)
  return true
}

/**
 * Creates a new QueryClient with default configuration.
 * Exported (in addition to being used internally by getQueryClient()) so tests can build an
 * isolated client instead of sharing the browser/server singletons.
 */
export function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (!shouldReportQueryError(query)) return

        // Queries capture here, exactly once per terminal failure (deduped above). Mutations
        // are handled separately by MutationErrorNotifier (breadcrumb + notification) — do
        // not also capture mutation errors here, and do not add Sentry capture to
        // MutationErrorNotifier, to keep each error captured at exactly one boundary.
        captureError(error, {
          tags: { queryHash: query.queryHash },
        })

        // Notifications are browser-only and can be opted out per-query via `meta.silent`
        // (e.g. background/prefetch queries that shouldn't interrupt the user).
        if (isServer || query.meta?.silent) return

        // Outside a component we don't have react-intl's useIntl(); presentError() already
        // provides pre-formatted English strings for exactly this kind of non-component use
        // (the template currently only ships an English locale).
        notifications.show({
          title: getUserFacingErrorTitle(error),
          message: getUserFacingErrorMessage(error),
          color: 'red',
        })
      },
    }),
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
