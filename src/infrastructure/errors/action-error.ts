/**
 * Server-side error utilities for Next.js Server Actions.
 *
 * Next.js serializes only `error.message` across the server→client boundary.
 * We encode the error code in the message as `[CODE] context` so the client
 * can extract it via `extractErrorCode()` and display a localized message
 * via `presentError()`.
 */

import { ValiError } from 'valibot'
import { logger } from '@/infrastructure/logging/logger'
import { INTERNAL_ERROR, VALIDATION_ERROR, isValidErrorCode, type ErrorCode } from './codes'

/**
 * Create an Error with encoded error code in message.
 * Format: `[VALIDATION_ERROR] createBlogAction`
 */
export function createActionError(code: ErrorCode, context: string): Error {
  return new Error(`[${code}] ${context}`)
}

/**
 * Extract error code from message format `[CODE] ...`.
 * Works on both server and client side.
 */
export function extractErrorCode(message: string): ErrorCode | null {
  const match = message.match(/^\[([A-Z_]+)\]/)
  if (!match) return null
  return isValidErrorCode(match[1]) ? match[1] : null
}

/**
 * Context suffix marking a safe-action `serverError` as already captured to Sentry
 * server-side (see `safe-action.ts`'s `handleServerError`). Next.js only serializes
 * `error.message` across the Server Action boundary, so this marker — not a property on
 * the Error instance — is the only signal that survives the round trip to the client.
 *
 * Client-side error boundaries that re-throw a safe-action `serverError` (e.g.
 * `unwrapSafeActionResult`) must check `isAlreadyCapturedActionErrorMessage` before
 * reporting to Sentry again, to avoid double-capturing the same incident once server-side
 * and once client-side.
 */
const CAPTURED_ACTION_CONTEXT_SUFFIX = ':captured'

export function withCapturedActionContext(context: string): string {
  return `${context}${CAPTURED_ACTION_CONTEXT_SUFFIX}`
}

export function isAlreadyCapturedActionErrorMessage(message: string): boolean {
  return message.endsWith(CAPTURED_ACTION_CONTEXT_SUFFIX)
}

/**
 * Centralized error handler for server actions.
 * Logs, reports to Sentry, and throws with encoded error code.
 *
 * Usage:
 * ```ts
 * catch (error) {
 *   handleActionError(error, 'createBlogAction')
 * }
 * ```
 */
export function handleActionError(error: unknown, actionName: string): never {
  logger.error(`[${actionName}] Failed:`, error)

  // Already our format [CODE] — the incident was handled/captured at its origin
  // (or will be captured exactly once by safe-action's handleServerError when the
  // code maps to a 5xx and the message is unmarked). Re-throw as-is, no capture —
  // capturing here too would double-report the same incident.
  if (error instanceof Error && extractErrorCode(error.message)) {
    throw error
  }

  // Uncoded error: THIS is the capture boundary. The thrown message carries the
  // :captured marker so downstream boundaries (safe-action, QueryCache.onError)
  // skip a second Sentry report of the same incident.
  const errorCode = error instanceof ValiError ? VALIDATION_ERROR : INTERNAL_ERROR
  const actionError = createActionError(errorCode, withCapturedActionContext(actionName))

  // Centralized Sentry reporting with original error details in extra
  import('@sentry/nextjs')
    .then((Sentry) => {
      Sentry.captureException(error, {
        tags: { action: actionName, errorCode },
        extra: { originalMessage: error instanceof Error ? error.message : String(error) },
      })
    })
    .catch(() => {})

  throw actionError
}
