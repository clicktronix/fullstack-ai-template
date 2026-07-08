import 'server-only'

import {
  AUTHENTICATION_ERROR,
  AUTHORIZATION_ERROR,
  BUSINESS_LOGIC_ERROR,
  CONFLICT_ERROR,
  CONNECTION_ERROR,
  DATA_FETCH_ERROR,
  DATA_PROVIDER_ERROR,
  RATE_LIMIT_EXCEEDED,
  RESOURCE_NOT_FOUND,
  TIMEOUT,
  VALIDATION_ERROR,
  getStatusForCode,
  type ErrorCode,
} from '@/infrastructure/errors/codes'
import { serverLogger } from '@/infrastructure/logging/server-logger'
import { getApiErrorCode } from './error-mapping'

// Re-exported for existing server-only call sites (with-route-error-handling.ts,
// safe-action.ts, with-server-read-error-handling.ts, tests) that import these from
// './response'. The implementations live in isomorphic (non-`server-only`) modules —
// `errors/codes.ts` and `api/error-mapping.ts` — so `ui/providers/query-client.ts`
// (browser + server) and `errors/action-error.ts` (which would otherwise cycle back
// through this file) can import them directly without pulling in `server-only`.
export { getApiErrorCode } from './error-mapping'
export { getStatusForCode } from '@/infrastructure/errors/codes'

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
