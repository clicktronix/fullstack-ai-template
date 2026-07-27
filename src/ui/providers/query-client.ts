import { QueryCache, QueryClient, isServer, type Query } from '@tanstack/react-query'
import { cache } from 'react'
import { getApiErrorCode } from '@/infrastructure/api/error-mapping'
import { isTestEnvironment } from '@/infrastructure/env/runtime'
import { isAlreadyCapturedActionErrorMessage } from '@/infrastructure/errors/action-error'
import { isRetryableError } from '@/infrastructure/errors/api-error'
import { getStatusForCode } from '@/infrastructure/errors/codes'
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

function requestIdFromError(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) return undefined
  const details = 'details' in error ? error.details : undefined
  if (typeof details !== 'object' || details === null || !('responseBody' in details)) {
    return undefined
  }
  const responseBody = details.responseBody
  if (
    typeof responseBody !== 'object' ||
    responseBody === null ||
    !('requestId' in responseBody) ||
    typeof responseBody.requestId !== 'string'
  ) {
    return undefined
  }
  return responseBody.requestId
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
//
// Keyed by the `Query` instance itself (WeakMap), not by `queryHash` (a string shared across
// every QueryClient). Server query clients are recreated per RSC request and browser queries
// can be GC'd/recreated, so two distinct `Query` objects can legitimately share a `queryHash`
// while representing unrelated failures — each starts its own `errorUpdateCount` at 1. Keying
// by object identity keeps their dedupe state independent instead of one client's recorded
// count silently suppressing another client's first failure for the same key. The WeakMap
// also lets entries for GC'd queries be collected instead of leaking for process lifetime.
const lastReportedErrorCount = new WeakMap<Query<unknown, unknown, unknown>, number>()

export function shouldReportQueryError(query: Query<unknown, unknown, unknown>): boolean {
  const { errorUpdateCount } = query.state
  if (lastReportedErrorCount.get(query) === errorUpdateCount) {
    return false
  }
  lastReportedErrorCount.set(query, errorUpdateCount)
  return true
}

/**
 * Shared predicate for "this error is unexpected and should reach the nearest
 * Error Boundary" — server errors (5xx) and network failures. Used by BOTH
 * `throwOnError` (below, so React Query actually re-throws it there) and
 * `QueryCache.onError` (so the inline toast is skipped when the boundary will
 * already show the error — otherwise the user sees the failure surfaced twice).
 * Expected, user-facing outcomes (4xx: not found, forbidden, validation, ...) are
 * NOT thrown here — they stay as query error state for inline/toast handling.
 */
export function shouldThrowToErrorBoundary(error: unknown): boolean {
  // Classify by mapped status, not by instanceof: safe-action query failures arrive as a
  // plain Error whose message is `[CODE] ...:captured` (serialized across the Server Action
  // boundary), NOT as an ApiError instance. getApiErrorCode resolves the code from either
  // shape (typed ApiError, coded message, ValiError) and defaults unknown/network errors to
  // INTERNAL_ERROR (500), so 5xx + network -> boundary, expected 4xx -> inline/toast.
  return getStatusForCode(getApiErrorCode(error)) >= 500
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
        //
        // Exception: safe-action-backed queries (e.g. work-items/labels queries and prefetch)
        // call a Server Action whose `handleServerError` (safe-action.ts) already captured
        // unexpected failures server-side before rethrowing a serialized `[CODE] safeAction`
        // error. `isAlreadyCapturedActionErrorMessage` detects that marker so we don't
        // double-capture the same incident — the user is still notified below.
        //
        // 4xx query outcomes (not found, forbidden, validation, ...) are expected, user-facing
        // results, not incidents — only capture when the mapped status is a genuine 5xx.
        const alreadyCaptured =
          error instanceof Error && isAlreadyCapturedActionErrorMessage(error.message)
        if (!alreadyCaptured && getStatusForCode(getApiErrorCode(error)) >= 500) {
          const requestId = requestIdFromError(error)
          captureError(error, {
            tags: { queryHash: query.queryHash },
            ...(requestId ? { request: { requestId } } : {}),
          })
        }

        // Notifications are browser-only and can be opted out per-query via `meta.silent`
        // (e.g. background/prefetch queries that shouldn't interrupt the user).
        if (isServer || query.meta?.silent) return

        // 5xx/network errors are re-thrown to the nearest Error Boundary by `throwOnError`
        // below (same predicate) — the boundary owns the UI for those. Showing a toast here
        // too would surface the same failure to the user twice.
        if (shouldThrowToErrorBoundary(error)) return

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
        throwOnError: shouldThrowToErrorBoundary,
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
