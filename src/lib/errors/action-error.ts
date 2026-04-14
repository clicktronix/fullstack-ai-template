/**
 * Server-side error utilities for Next.js Server Actions.
 *
 * Next.js serializes only `error.message` across the server→client boundary.
 * We encode the error code in the message as `[CODE] context` so the client
 * can extract it via `extractErrorCode()` and display a localized message
 * via `presentError()`.
 */

import { ValiError } from 'valibot'
import { logger } from '@/lib/logger'
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

  // Resolve error code and create action error
  let actionError: Error
  let errorCode: string

  if (error instanceof ValiError) {
    // ValiError → VALIDATION_ERROR (check before generic Error since ValiError extends Error)
    errorCode = VALIDATION_ERROR
    actionError = createActionError(VALIDATION_ERROR, actionName)
  } else if (error instanceof Error) {
    const existingCode = extractErrorCode(error.message)
    if (existingCode) {
      // Already our format [CODE] — re-throw as-is
      errorCode = existingCode
      actionError = error
    } else {
      // Generic Error → INTERNAL_ERROR (don't leak server details to client)
      errorCode = INTERNAL_ERROR
      actionError = createActionError(INTERNAL_ERROR, actionName)
    }
  } else {
    // Non-Error → INTERNAL_ERROR
    errorCode = INTERNAL_ERROR
    actionError = createActionError(INTERNAL_ERROR, actionName)
  }

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
