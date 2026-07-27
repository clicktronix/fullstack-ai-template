import 'server-only'

import {
  createReportingRequestContext,
  runWithReportingRequestContext,
} from '@/infrastructure/request-context/request-context'
import { captureError } from '@/infrastructure/sentry/capture'
import { getRequestId } from './context'
import { apiError, getApiErrorCode, getStatusForCode } from './response'

type RouteHandler<Args extends unknown[]> = (request: Request, ...args: Args) => Promise<Response>

/**
 * Wrap a Next.js route handler with centralized error handling.
 *
 * - Maps any thrown error (typed ApiError, ValiError, action-error-coded Error, or a
 *   generic Error) to a status code + public JSON envelope via `apiError` — raw error
 *   messages never leak to the client.
 * - Captures unexpected (5xx / unclassified) errors to Sentry exactly once, tagged with
 *   the route name and HTTP method. This is the inbound-boundary capture for route
 *   handlers: once a handler catches and converts an error into a Response, it never
 *   reaches Next.js's own `onRequestError` instrumentation, so this is the only place
 *   those errors get reported.
 * - 4xx errors (validation, not found, forbidden, ...) are not captured — they are
 *   expected, user-facing outcomes, not incidents.
 *
 * Apply this to every route handler under `src/app/**\/route.ts` and
 * `src/adapters/inbound/next/route-handlers/**`.
 */
export function withRouteErrorHandling<Args extends unknown[]>(
  routeName: string,
  handler: RouteHandler<Args>
): RouteHandler<Args> {
  return async (request, ...args) => {
    const requestId = getRequestId(request)
    const reportingContext = createReportingRequestContext({ requestId })

    return runWithReportingRequestContext(reportingContext, async () => {
      try {
        return await handler(request, ...args)
      } catch (error) {
        const status = getStatusForCode(getApiErrorCode(error))

        if (status >= 500) {
          captureError(error, {
            tags: { route: routeName, method: request.method },
            request: reportingContext,
          })
        }

        return apiError(error, requestId)
      }
    })
  }
}
