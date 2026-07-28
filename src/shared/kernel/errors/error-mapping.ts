/**
 * Isomorphic error -> ErrorCode classification.
 *
 * Deliberately has no `server-only` import (unlike `response.ts`, which re-exports
 * this for server call sites): `getApiErrorCode` is needed from the browser-safe
 * TanStack Query `QueryCache.onError` config (`ui/providers/query-client.ts`) as well
 * as from server-only boundaries (route handlers, the server-read wrapper). None of
 * its own dependencies (`action-error.ts`, `errors/api-error.ts`, `errors/codes.ts`)
 * are server-only either.
 */

import { ValiError } from 'valibot'
import { extractErrorCode } from '@/shared/kernel/errors/action-error'
import { getErrorCode, isApiError } from '@/shared/kernel/errors/api-error'
import {
  AUTHENTICATION_ERROR,
  AUTHORIZATION_ERROR,
  CONFLICT_ERROR,
  INTERNAL_ERROR,
  RATE_LIMIT_EXCEEDED,
  RESOURCE_NOT_FOUND,
  VALIDATION_ERROR,
  isValidErrorCode,
  type ErrorCode,
} from '@/shared/kernel/errors/codes'

export function getApiErrorCode(error: unknown): ErrorCode {
  if (error instanceof ValiError) return VALIDATION_ERROR

  if (error instanceof Error) {
    const actionCode = extractErrorCode(error.message)
    if (actionCode) return actionCode
  }

  if (isApiError(error)) {
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
    }
  }

  return INTERNAL_ERROR
}
