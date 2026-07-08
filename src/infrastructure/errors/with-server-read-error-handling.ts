import 'server-only'

import { getApiErrorCode, getStatusForCode } from '@/infrastructure/api/response'
import { captureError } from '@/infrastructure/sentry/capture'
import { extractErrorCode, isAlreadyCapturedActionErrorMessage } from './action-error'

type ReadFn<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>

/**
 * Wrap a server-only RSC/DAL read entrypoint (e.g. a `prefetchQuery` call in a
 * Server Component) with centralized error handling.
 *
 * - Errors whose message carries the `:captured` marker (see `withCapturedActionContext`)
 *   were already reported once at their originating boundary — typically a Server Action
 *   behind `safe-action.ts` or `handleActionError`. This wrapper rethrows them unchanged
 *   and does NOT capture again (no double-capture). A merely CODED but unmarked error is
 *   NOT proof of an upstream capture: an unmarked 5xx-coded error is captured here, at
 *   its claimed boundary — same rule as safe-action's handleServerError.
 * - Any other, genuinely new error is classified the same way route handlers are
 *   (`getApiErrorCode`/`getStatusForCode`): only unexpected (5xx) failures are captured to
 *   Sentry, tagged with the read name, exactly once.
 * - The original error (typed ApiError or otherwise) is always rethrown unchanged so the
 *   nearest `error.tsx` / `ErrorBoundary` / `ApiErrorBoundary` can render it correctly.
 */
export function withServerReadErrorHandling<TArgs extends unknown[], TResult>(
  readName: string,
  fn: ReadFn<TArgs, TResult>
): ReadFn<TArgs, TResult> {
  return async (...args: TArgs) => {
    try {
      return await fn(...args)
    } catch (error) {
      const alreadyCapturedUpstream =
        error instanceof Error && isAlreadyCapturedActionErrorMessage(error.message)
      const precodedCode = error instanceof Error ? extractErrorCode(error.message) : null
      const status = getStatusForCode(precodedCode ?? getApiErrorCode(error))

      if (!alreadyCapturedUpstream && status >= 500) {
        captureError(error, { tags: { read: readName } })
      }

      throw error
    }
  }
}
