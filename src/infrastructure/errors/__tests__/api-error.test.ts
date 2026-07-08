import { describe, expect, test } from 'bun:test'
import {
  ApiError,
  NetworkError,
  HttpError,
  ClientError,
  ServerError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  createHttpError,
  isApiError,
  isRetryableError,
  getErrorStatus,
  isRateLimitError,
  getErrorCode,
} from '../api-error'

describe('ApiError', () => {
  test('creates error with message', () => {
    const error = new ApiError('Something went wrong')
    expect(error.message).toBe('Something went wrong')
    expect(error.name).toBe('ApiError')
  })

  test('creates error with details', () => {
    const error = new ApiError('Error', { path: '/api/test', method: 'GET' })
    expect(error.details.path).toBe('/api/test')
    expect(error.details.method).toBe('GET')
  })

  test('isRetryable returns true when no status', () => {
    const error = new ApiError('Network failed')
    expect(error.isRetryable()).toBe(true)
  })

  test('isRetryable returns true for 5xx', () => {
    const error = new ApiError('Server error', { status: 500 })
    expect(error.isRetryable()).toBe(true)
  })

  test('isRetryable returns false for 4xx', () => {
    const error = new ApiError('Client error', { status: 400 })
    expect(error.isRetryable()).toBe(false)
  })

  test('getStatus returns status from details', () => {
    const error = new ApiError('Error', { status: 404 })
    expect(error.getStatus()).toBe(404)
  })

  test('toJSON returns structured data', () => {
    const error = new ApiError('Error', { status: 500 })
    const json = error.toJSON()
    expect(json.name).toBe('ApiError')
    expect(json.message).toBe('Error')
    expect(json.details.status).toBe(500)
  })
})

describe('NetworkError', () => {
  test('creates network error', () => {
    const error = new NetworkError('Failed to fetch')
    expect(error.name).toBe('NetworkError')
    expect(error.message).toBe('Failed to fetch')
  })

  test('is always retryable', () => {
    const error = new NetworkError('Network failed')
    expect(error.isRetryable()).toBe(true)
  })

  test('inherits from ApiError', () => {
    const error = new NetworkError('Failed')
    expect(error instanceof ApiError).toBe(true)
  })
})

describe('HttpError', () => {
  test('creates HTTP error with status', () => {
    const error = new HttpError(500, 'Internal Server Error')
    expect(error.name).toBe('HttpError')
    expect(error.status).toBe(500)
    expect(error.details.status).toBe(500)
  })

  test('isRetryable returns true for 5xx', () => {
    expect(new HttpError(500, 'Error').isRetryable()).toBe(true)
    expect(new HttpError(502, 'Error').isRetryable()).toBe(true)
    expect(new HttpError(503, 'Error').isRetryable()).toBe(true)
  })

  test('isRetryable returns false for 4xx', () => {
    expect(new HttpError(400, 'Error').isRetryable()).toBe(false)
    expect(new HttpError(404, 'Error').isRetryable()).toBe(false)
    expect(new HttpError(422, 'Error').isRetryable()).toBe(false)
  })
})

describe('ClientError', () => {
  test('creates client error', () => {
    const error = new ClientError(400, 'Bad Request')
    expect(error.name).toBe('ClientError')
    expect(error.status).toBe(400)
  })

  test('is never retryable', () => {
    const error = new ClientError(400, 'Bad Request')
    expect(error.isRetryable()).toBe(false)
  })

  test('inherits from HttpError', () => {
    const error = new ClientError(400, 'Error')
    expect(error instanceof HttpError).toBe(true)
    expect(error instanceof ApiError).toBe(true)
  })
})

describe('ServerError', () => {
  test('creates server error', () => {
    const error = new ServerError(500, 'Internal Server Error')
    expect(error.name).toBe('ServerError')
    expect(error.status).toBe(500)
  })

  test('is always retryable', () => {
    const error = new ServerError(500, 'Error')
    expect(error.isRetryable()).toBe(true)
  })

  test('inherits from HttpError', () => {
    const error = new ServerError(500, 'Error')
    expect(error instanceof HttpError).toBe(true)
    expect(error instanceof ApiError).toBe(true)
  })
})

describe('UnauthorizedError', () => {
  test('creates with default message', () => {
    const error = new UnauthorizedError()
    expect(error.name).toBe('UnauthorizedError')
    expect(error.message).toBe('Unauthorized')
    expect(error.status).toBe(401)
  })

  test('creates with custom message', () => {
    const error = new UnauthorizedError('Invalid token')
    expect(error.message).toBe('Invalid token')
  })

  test('is not retryable', () => {
    const error = new UnauthorizedError()
    expect(error.isRetryable()).toBe(false)
  })

  test('inherits from ClientError', () => {
    const error = new UnauthorizedError()
    expect(error instanceof ClientError).toBe(true)
  })
})

describe('ForbiddenError', () => {
  test('creates with default message', () => {
    const error = new ForbiddenError()
    expect(error.name).toBe('ForbiddenError')
    expect(error.message).toBe('Forbidden')
    expect(error.status).toBe(403)
  })

  test('is not retryable', () => {
    const error = new ForbiddenError()
    expect(error.isRetryable()).toBe(false)
  })
})

describe('NotFoundError', () => {
  test('creates with default message', () => {
    const error = new NotFoundError()
    expect(error.name).toBe('NotFoundError')
    expect(error.message).toBe('Not Found')
    expect(error.status).toBe(404)
  })

  test('is not retryable', () => {
    const error = new NotFoundError()
    expect(error.isRetryable()).toBe(false)
  })
})

describe('RateLimitError', () => {
  test('creates with retryAfter and default message', () => {
    const error = new RateLimitError(30)
    expect(error.name).toBe('RateLimitError')
    expect(error.message).toBe('Too Many Requests')
    expect(error.status).toBe(429)
    expect(error.retryAfter).toBe(30)
  })

  test('creates with custom message', () => {
    const error = new RateLimitError(60, 'Rate limit exceeded')
    expect(error.message).toBe('Rate limit exceeded')
    expect(error.retryAfter).toBe(60)
  })

  test('stores retryAfter in details', () => {
    const error = new RateLimitError(45)
    expect(error.details.retryAfter).toBe(45)
  })

  test('getRetryDelayMs converts seconds to milliseconds', () => {
    const error = new RateLimitError(30)
    expect(error.getRetryDelayMs()).toBe(30_000)
  })

  test('is not retryable (client error)', () => {
    const error = new RateLimitError(60)
    expect(error.isRetryable()).toBe(false)
  })

  test('inherits from ClientError', () => {
    const error = new RateLimitError(30)
    expect(error instanceof ClientError).toBe(true)
    expect(error instanceof HttpError).toBe(true)
    expect(error instanceof ApiError).toBe(true)
  })
})

describe('ValidationError', () => {
  test('creates validation error', () => {
    const error = new ValidationError('Invalid input')
    expect(error.name).toBe('ValidationError')
    expect(error.message).toBe('Invalid input')
  })

  test('is not retryable', () => {
    const error = new ValidationError('Error')
    expect(error.isRetryable()).toBe(false)
  })

  test('inherits from ApiError', () => {
    const error = new ValidationError('Error')
    expect(error instanceof ApiError).toBe(true)
  })
})

describe('createHttpError', () => {
  test('creates UnauthorizedError for 401', () => {
    const error = createHttpError(401, 'Unauthorized')
    expect(error).toBeInstanceOf(UnauthorizedError)
    expect(error.status).toBe(401)
  })

  test('creates ForbiddenError for 403', () => {
    const error = createHttpError(403, 'Forbidden')
    expect(error).toBeInstanceOf(ForbiddenError)
    expect(error.status).toBe(403)
  })

  test('creates NotFoundError for 404', () => {
    const error = createHttpError(404, 'Not Found')
    expect(error).toBeInstanceOf(NotFoundError)
    expect(error.status).toBe(404)
  })

  test('creates RateLimitError for 429', () => {
    const error = createHttpError(429, 'Too Many Requests', { retryAfter: 30 })
    expect(error).toBeInstanceOf(RateLimitError)
    expect(error.status).toBe(429)
    expect((error as RateLimitError).retryAfter).toBe(30)
  })

  test('creates RateLimitError with default retryAfter when not provided', () => {
    const error = createHttpError(429, 'Rate limited')
    expect(error).toBeInstanceOf(RateLimitError)
    expect((error as RateLimitError).retryAfter).toBe(60) // default
  })

  test('creates ClientError for other 4xx', () => {
    const error = createHttpError(400, 'Bad Request')
    expect(error).toBeInstanceOf(ClientError)
    expect(error.status).toBe(400)
  })

  test('creates ClientError for 422', () => {
    const error = createHttpError(422, 'Unprocessable Entity')
    expect(error).toBeInstanceOf(ClientError)
    expect(error.status).toBe(422)
  })

  test('creates ServerError for 5xx', () => {
    const error = createHttpError(500, 'Internal Server Error')
    expect(error).toBeInstanceOf(ServerError)
    expect(error.status).toBe(500)
  })

  test('creates ServerError for 502', () => {
    const error = createHttpError(502, 'Bad Gateway')
    expect(error).toBeInstanceOf(ServerError)
    expect(error.status).toBe(502)
  })

  test('passes details to created error', () => {
    const error = createHttpError(404, 'Not Found', { path: '/api/test' })
    expect(error.details.path).toBe('/api/test')
  })
})

describe('isApiError', () => {
  test('returns true for ApiError', () => {
    expect(isApiError(new ApiError('Error'))).toBe(true)
  })

  test('returns true for subclasses', () => {
    expect(isApiError(new NetworkError('Error'))).toBe(true)
    expect(isApiError(new HttpError(500, 'Error'))).toBe(true)
    expect(isApiError(new ClientError(400, 'Error'))).toBe(true)
    expect(isApiError(new ServerError(500, 'Error'))).toBe(true)
    expect(isApiError(new UnauthorizedError())).toBe(true)
    expect(isApiError(new ValidationError('Error'))).toBe(true)
  })

  test('returns false for regular Error', () => {
    expect(isApiError(new Error('Error'))).toBe(false)
  })

  test('returns false for non-error values', () => {
    expect(isApiError(null)).toBe(false)

    expect(isApiError(undefined)).toBe(false)
    expect(isApiError('error')).toBe(false)
    expect(isApiError({ message: 'error' })).toBe(false)
  })
})

describe('isRetryableError', () => {
  test('returns true for retryable errors', () => {
    expect(isRetryableError(new NetworkError('Error'))).toBe(true)
    expect(isRetryableError(new ServerError(500, 'Error'))).toBe(true)
    expect(isRetryableError(new ApiError('Error'))).toBe(true)
  })

  test('returns false for non-retryable errors', () => {
    expect(isRetryableError(new ClientError(400, 'Error'))).toBe(false)
    expect(isRetryableError(new UnauthorizedError())).toBe(false)
    expect(isRetryableError(new ValidationError('Error'))).toBe(false)
  })

  test('returns false for non-ApiError', () => {
    expect(isRetryableError(new Error('Error'))).toBe(false)
    expect(isRetryableError(null)).toBe(false)
  })
})

describe('getErrorStatus', () => {
  test('returns status for ApiError', () => {
    expect(getErrorStatus(new HttpError(404, 'Not Found'))).toBe(404)
    expect(getErrorStatus(new ApiError('Error', { status: 500 }))).toBe(500)
  })

  test('returns undefined for error without status', () => {
    expect(getErrorStatus(new ApiError('Error'))).toBeUndefined()
    expect(getErrorStatus(new NetworkError('Error'))).toBeUndefined()
  })

  test('returns undefined for non-ApiError', () => {
    expect(getErrorStatus(new Error('Error'))).toBeUndefined()
    expect(getErrorStatus(null)).toBeUndefined()
    expect(getErrorStatus('error')).toBeUndefined()
  })
})

describe('isRateLimitError', () => {
  test('returns true for RateLimitError', () => {
    expect(isRateLimitError(new RateLimitError(30))).toBe(true)
  })

  test('returns false for other ClientErrors', () => {
    expect(isRateLimitError(new ClientError(400, 'Bad Request'))).toBe(false)
    expect(isRateLimitError(new UnauthorizedError())).toBe(false)
    expect(isRateLimitError(new ForbiddenError())).toBe(false)
    expect(isRateLimitError(new NotFoundError())).toBe(false)
  })

  test('returns false for non-ApiError', () => {
    expect(isRateLimitError(new Error('Error'))).toBe(false)
    expect(isRateLimitError(null)).toBe(false)
    expect(isRateLimitError({ retryAfter: 30 })).toBe(false)
  })
})

describe('getErrorCode', () => {
  test('returns errorCode from ApiError details', () => {
    const error = new ApiError('Error', { errorCode: 'INVALID_TOKEN' })
    expect(getErrorCode(error)).toBe('INVALID_TOKEN')
  })

  test('returns errorCode from HttpError', () => {
    const error = createHttpError(400, 'Bad Request', { errorCode: 'VALIDATION_FAILED' })
    expect(getErrorCode(error)).toBe('VALIDATION_FAILED')
  })

  test('returns undefined when errorCode not set', () => {
    const error = new ApiError('Error')
    expect(getErrorCode(error)).toBeUndefined()
  })

  test('returns undefined for non-ApiError', () => {
    expect(getErrorCode(new Error('Error'))).toBeUndefined()
    expect(getErrorCode(null)).toBeUndefined()
    expect(getErrorCode({ errorCode: 'TEST' })).toBeUndefined()
  })
})
