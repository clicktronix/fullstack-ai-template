import 'server-only'

import { createSafeActionClient, isNavigationError } from 'next-safe-action'
import { getStatusForCode } from '@/infrastructure/api/response'
import { createAuthenticatedContext } from '@/infrastructure/auth/authenticated-context'
import {
  createActionError,
  extractErrorCode,
  isAlreadyCapturedActionErrorMessage,
  withCapturedActionContext,
} from '@/infrastructure/errors/action-error'
import { getErrorCode, isApiError } from '@/infrastructure/errors/api-error'
import {
  AUTHENTICATION_ERROR,
  AUTHORIZATION_ERROR,
  CONFLICT_ERROR,
  HTTP_ERROR,
  INTERNAL_ERROR,
  RATE_LIMIT_EXCEEDED,
  RESOURCE_NOT_FOUND,
  VALIDATION_ERROR,
  isValidErrorCode,
  type ErrorCode,
} from '@/infrastructure/errors/codes'
import { serverLogger } from '@/infrastructure/logging/server-logger'
import { captureError } from '@/infrastructure/sentry/capture'

type SafeActionResultLike<TData> = {
  data?: TData
  serverError?: string
  validationErrors?: unknown
}

function getApiActionErrorCode(error: unknown): ErrorCode | null {
  if (!isApiError(error)) return null

  const backendCode = getErrorCode(error)
  if (backendCode && isValidErrorCode(backendCode)) return backendCode

  switch (error.getStatus()) {
    case 400:
    case 422: {
      return VALIDATION_ERROR
    }
    case 401: {
      return AUTHENTICATION_ERROR
    }
    case 403: {
      return AUTHORIZATION_ERROR
    }
    case 404: {
      return RESOURCE_NOT_FOUND
    }
    case 409: {
      return CONFLICT_ERROR
    }
    case 429: {
      return RATE_LIMIT_EXCEEDED
    }
    default: {
      return HTTP_ERROR
    }
  }
}

export const actionClient = createSafeActionClient({
  defaultValidationErrorsShape: 'flattened',
  handleServerError(error) {
    const maybeNavigationError: unknown = error
    if (isNavigationError(maybeNavigationError)) {
      throw error
    }

    serverLogger.error({ error }, 'safe action failed')

    // This is the inbound boundary for every Server Action built on actionClient/
    // authActionClient/adminActionClient — capture unexpected errors here exactly once.
    // Already-coded errors (thrown via createActionError elsewhere, e.g. the pending/role
    // checks in the `.use()` middleware below) are expected, typed outcomes — not incidents —
    // so they are re-thrown/mapped without a Sentry capture.
    if (error instanceof Error) {
      const precodedCode = extractErrorCode(error.message)
      if (precodedCode) {
        // A pre-coded error whose code maps to a 5xx is still an incident: capture it
        // once here (unless a lower boundary already marked it) and mark the message.
        if (
          getStatusForCode(precodedCode) >= 500 &&
          !isAlreadyCapturedActionErrorMessage(error.message)
        ) {
          captureError(error, { tags: { boundary: 'safe-action' } })
          return createActionError(precodedCode, withCapturedActionContext('safeAction')).message
        }
        return error.message
      }
    }

    const apiErrorCode = getApiActionErrorCode(error)
    if (apiErrorCode) {
      // Any code mapping to a 5xx (HTTP_ERROR's unexpected status, upstream 502/504
      // provider codes, ...) is an incident worth capturing. Codes mapping to 4xx
      // (auth/validation/not-found/conflict/rate-limit) are expected, user-facing outcomes.
      if (getStatusForCode(apiErrorCode) >= 500) {
        captureError(error, { tags: { boundary: 'safe-action' } })
        // Mark the rethrown message so QueryCache.onError (query-client.ts) knows this
        // incident was already captured here and skips a second Sentry report.
        return createActionError(apiErrorCode, withCapturedActionContext('safeAction')).message
      }
      return createActionError(apiErrorCode, 'safeAction').message
    }

    captureError(error, { tags: { boundary: 'safe-action' } })
    // Same "already captured" marker as above — this is the other branch that reports here.
    return createActionError(INTERNAL_ERROR, withCapturedActionContext('safeAction')).message
  },
})

export const authActionClient = actionClient.use(async ({ next }) => {
  const ctx = await createAuthenticatedContext()

  if (ctx.role === 'pending') {
    throw createActionError(AUTHORIZATION_ERROR, 'authActionClient: account pending approval')
  }

  return next({ ctx })
})

export const adminActionClient = actionClient.use(async ({ next }) => {
  const ctx = await createAuthenticatedContext()

  if (ctx.role === 'pending') {
    throw createActionError(AUTHORIZATION_ERROR, 'adminActionClient: account pending approval')
  }

  if (ctx.role !== 'admin' && ctx.role !== 'owner') {
    throw createActionError(AUTHORIZATION_ERROR, 'adminActionClient: insufficient role')
  }

  return next({ ctx })
})

export function unwrapSafeActionResult<TData>(result: SafeActionResultLike<TData>): TData {
  if (result.serverError) {
    throw new Error(result.serverError)
  }

  if (result.validationErrors) {
    throw createActionError(VALIDATION_ERROR, 'safeAction.validation')
  }

  if (result.data === undefined) {
    throw createActionError(INTERNAL_ERROR, 'safeAction.emptyResult')
  }

  return result.data
}

export function unwrapVoidSafeActionResult(result: SafeActionResultLike<void>): void {
  if (result.serverError) {
    throw new Error(result.serverError)
  }

  if (result.validationErrors) {
    throw createActionError(VALIDATION_ERROR, 'safeAction.validation')
  }
}
