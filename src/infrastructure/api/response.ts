import 'server-only'

import { ValiError } from 'valibot'
import { extractErrorCode } from '@/infrastructure/errors/action-error'
import { getErrorCode, isApiError } from '@/infrastructure/errors/api-error'
import {
  ADMIN_OPERATION_ERROR,
  AGENT_PROCESSING_ERROR,
  ANALYSIS_ERROR,
  AUTHENTICATION_ERROR,
  AUTHORIZATION_ERROR,
  BUSINESS_LOGIC_ERROR,
  CONFLICT_ERROR,
  CONNECTION_ERROR,
  DATA_FETCH_ERROR,
  DATA_PROVIDER_ERROR,
  HTTP_ERROR,
  INTERNAL_ERROR,
  RATE_LIMIT_EXCEEDED,
  RESOURCE_NOT_FOUND,
  TIMEOUT,
  UNKNOWN_ERROR,
  VALIDATION_ERROR,
  isValidErrorCode,
  type ErrorCode,
} from '@/infrastructure/errors/codes'
import { serverLogger } from '@/infrastructure/logging/server-logger'

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

export function getStatusForCode(code: ErrorCode): number {
  switch (code) {
    case VALIDATION_ERROR:
    case BUSINESS_LOGIC_ERROR: {
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
    case RATE_LIMIT_EXCEEDED: {
      return 429
    }
    case DATA_FETCH_ERROR:
    case DATA_PROVIDER_ERROR:
    case CONNECTION_ERROR: {
      return 502
    }
    case TIMEOUT: {
      return 504
    }
    case INTERNAL_ERROR:
    case ANALYSIS_ERROR:
    case AGENT_PROCESSING_ERROR:
    case ADMIN_OPERATION_ERROR:
    case HTTP_ERROR:
    case UNKNOWN_ERROR: {
      return 500
    }
    default: {
      return 500
    }
  }
}

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
    case RATE_LIMIT_EXCEEDED: {
      return 'Too many requests'
    }
    case BUSINESS_LOGIC_ERROR: {
      return 'Request cannot be processed'
    }
    case DATA_FETCH_ERROR:
    case DATA_PROVIDER_ERROR:
    case CONNECTION_ERROR: {
      return 'Upstream service unavailable'
    }
    case TIMEOUT: {
      return 'Upstream request timed out'
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
