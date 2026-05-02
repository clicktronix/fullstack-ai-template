import 'server-only'

import { ValiError } from 'valibot'
import { extractErrorCode } from '@/lib/errors/action-error'
import { getErrorCode, isApiError } from '@/lib/errors/api-error'
import {
  AUTHENTICATION_ERROR,
  AUTHORIZATION_ERROR,
  CONFLICT_ERROR,
  INTERNAL_ERROR,
  RESOURCE_NOT_FOUND,
  VALIDATION_ERROR,
  isValidErrorCode,
  type ErrorCode,
} from '@/lib/errors/codes'
import { serverLogger } from '@/lib/server-logger'

type ApiErrorEnvelope = {
  error: {
    code: ErrorCode
    message: string
  }
  requestId: string
}

type ApiSuccessEnvelope<TData> = {
  data: TData
  requestId: string
}

function getStatusForCode(code: ErrorCode): number {
  switch (code) {
    case VALIDATION_ERROR: {
      return 400
    }
    case AUTHENTICATION_ERROR: {
      return 401
    }
    case AUTHORIZATION_ERROR: {
      return 403
    }
    case RESOURCE_NOT_FOUND: {
      return 404
    }
    case CONFLICT_ERROR: {
      return 409
    }
    default: {
      return 500
    }
  }
}

function getApiErrorCode(error: unknown): ErrorCode {
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
    }
  }

  return INTERNAL_ERROR
}

function getPublicErrorMessage(code: ErrorCode): string {
  switch (code) {
    case VALIDATION_ERROR: {
      return 'Request validation failed'
    }
    case AUTHENTICATION_ERROR: {
      return 'Authentication required'
    }
    case AUTHORIZATION_ERROR: {
      return 'Permission denied'
    }
    case RESOURCE_NOT_FOUND: {
      return 'Resource not found'
    }
    case CONFLICT_ERROR: {
      return 'Request conflicts with existing state'
    }
    default: {
      return 'Internal server error'
    }
  }
}

export function apiJson<TData>(data: TData, requestId: string, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers)
  headers.set('content-type', 'application/json')
  headers.set('x-request-id', requestId)

  return Response.json({ data, requestId } satisfies ApiSuccessEnvelope<TData>, {
    ...init,
    headers,
  })
}

export function apiError(error: unknown, requestId: string): Response {
  const code = getApiErrorCode(error)
  const status = getStatusForCode(code)

  if (status >= 500) {
    serverLogger.error({ error, requestId, code }, 'api route failed')
  } else {
    serverLogger.warn({ error, requestId, code }, 'api route rejected request')
  }

  return apiErrorWithCode(code, requestId, status)
}

export function apiErrorWithCode(
  code: ErrorCode,
  requestId: string,
  status = getStatusForCode(code)
) {
  return Response.json(
    {
      error: {
        code,
        message: getPublicErrorMessage(code),
      },
      requestId,
    } satisfies ApiErrorEnvelope,
    {
      status,
      headers: {
        'content-type': 'application/json',
        'x-request-id': requestId,
      },
    }
  )
}
