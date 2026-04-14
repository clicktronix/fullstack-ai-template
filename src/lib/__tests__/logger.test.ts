import { beforeEach, describe, expect, spyOn, test } from 'bun:test'
import { ApiError, ClientError, ServerError, NetworkError } from '../errors/api-error'
import { logger } from '../logger'

// Mock console methods
const mockConsoleLog = spyOn(console, 'log')
const mockConsoleError = spyOn(console, 'error')
const mockConsoleWarn = spyOn(console, 'warn')
const mockConsoleInfo = spyOn(console, 'info')
const mockConsoleGroup = spyOn(console, 'group')
const mockConsoleGroupEnd = spyOn(console, 'groupEnd')

beforeEach(() => {
  mockConsoleLog.mockClear()
  mockConsoleError.mockClear()
  mockConsoleWarn.mockClear()
  mockConsoleInfo.mockClear()
  mockConsoleGroup.mockClear()
  mockConsoleGroupEnd.mockClear()
})

// NOTE: In test environment (NODE_ENV=test), isDevelopment is false
// So logger.log, logger.warn, logger.info will NOT log
// Only logger.error and logger.apiError will log

describe('logger.log', () => {
  test('does not log in test environment (similar to production)', () => {
    logger.log('test message')

    // In test env, isDevelopment is false, so log is not called
    expect(mockConsoleLog).not.toHaveBeenCalled()
  })

  test('accepts multiple arguments without error', () => {
    // Just verify the function doesn't throw
    expect(() => logger.log('message', 123, { data: 'test' })).not.toThrow()
  })
})

describe('logger.error', () => {
  test('always logs errors (even in production/test)', () => {
    logger.error('error message')

    expect(mockConsoleError).toHaveBeenCalledWith('error message')
  })

  test('passes multiple arguments', () => {
    const error = new Error('test')
    logger.error('message', error)

    expect(mockConsoleError).toHaveBeenCalledWith('message', error)
  })

  test('handles undefined and null arguments', () => {
    logger.error('error', undefined, null)

    expect(mockConsoleError).toHaveBeenCalledWith('error', undefined, null)
  })
})

describe('logger.warn', () => {
  test('does not log in test environment (similar to production)', () => {
    logger.warn('warning message')

    expect(mockConsoleWarn).not.toHaveBeenCalled()
  })
})

describe('logger.info', () => {
  test('does not log in test environment (similar to production)', () => {
    logger.info('info message')

    expect(mockConsoleInfo).not.toHaveBeenCalled()
  })
})

describe('logger.apiError', () => {
  test('logs non-API errors with context', () => {
    const error = new Error('Generic error')
    logger.apiError('TestContext', error)

    expect(mockConsoleError).toHaveBeenCalledWith('[TestContext] Non-API Error:', error)
  })

  test('logs non-API errors without metadata', () => {
    const error = new TypeError('Type error')
    logger.apiError('TypeContext', error)

    expect(mockConsoleError).toHaveBeenCalledWith('[TypeContext] Non-API Error:', error)
  })

  test('handles string as error', () => {
    logger.apiError('StringError', 'just a string')

    expect(mockConsoleError).toHaveBeenCalledWith('[StringError] Non-API Error:', 'just a string')
  })

  test('handles null as error', () => {
    logger.apiError('NullError', null)

    expect(mockConsoleError).toHaveBeenCalledWith('[NullError] Non-API Error:', null)
  })

  test('logs ApiError as JSON in test/production environment', () => {
    const error = new ApiError('Something went wrong', { status: 500, path: '/api/test' })
    logger.apiError('UserAPI.getUser', error)

    // In test env (isDevelopment=false), uses JSON output
    expect(mockConsoleGroup).not.toHaveBeenCalled()
    expect(mockConsoleError).toHaveBeenCalled()

    // Verify JSON format
    const callArgs = mockConsoleError.mock.calls[0]
    expect(callArgs[0]).toBe('[API Error]')
    const jsonString = callArgs[1] as string
    expect(jsonString).toContain('"context":"UserAPI.getUser"')
    expect(jsonString).toContain('"status":500')
  })

  test('logs ServerError with retryable=true', () => {
    const error = new ServerError(503, 'Service unavailable')
    logger.apiError('Test', error)

    const jsonString = mockConsoleError.mock.calls[0][1] as string
    expect(jsonString).toContain('"retryable":true')
    expect(jsonString).toContain('"status":503')
  })

  test('logs ClientError with retryable=false', () => {
    const error = new ClientError(400, 'Bad request')
    logger.apiError('Test', error)

    const jsonString = mockConsoleError.mock.calls[0][1] as string
    expect(jsonString).toContain('"retryable":false')
    expect(jsonString).toContain('"status":400')
  })

  test('logs NetworkError with retryable=true', () => {
    const error = new NetworkError('Connection failed')
    logger.apiError('Test', error)

    const jsonString = mockConsoleError.mock.calls[0][1] as string
    expect(jsonString).toContain('"retryable":true')
  })

  test('includes metadata in JSON output', () => {
    const error = new ApiError('Test error', { status: 400 })
    const metadata = { userId: 123, action: 'fetch' }
    logger.apiError('TestContext', error, metadata)

    const jsonString = mockConsoleError.mock.calls[0][1] as string
    expect(jsonString).toContain('"userId":123')
    expect(jsonString).toContain('"action":"fetch"')
  })

  test('includes timestamp in JSON output', () => {
    const error = new ApiError('Test', { status: 500 })
    logger.apiError('Test', error)

    const jsonString = mockConsoleError.mock.calls[0][1] as string
    expect(jsonString).toContain('"timestamp"')
  })

  test('includes error details in JSON output', () => {
    const error = new ApiError('Test error', {
      status: 404,
      path: '/api/v1/users/123',
      method: 'GET',
    })
    logger.apiError('UserAPI', error)

    const jsonString = mockConsoleError.mock.calls[0][1] as string
    expect(jsonString).toContain('"path":"/api/v1/users/123"')
    expect(jsonString).toContain('"method":"GET"')
  })
})

describe('logger.apiSuccess', () => {
  test('does not log in test environment (similar to production)', () => {
    logger.apiSuccess('UserAPI.getUser', { id: 1, name: 'Test' })

    expect(mockConsoleLog).not.toHaveBeenCalled()
  })

  test('accepts data without error', () => {
    expect(() => logger.apiSuccess('Test', { data: 'value' })).not.toThrow()
  })

  test('accepts no data without error', () => {
    expect(() => logger.apiSuccess('Test')).not.toThrow()
  })
})

// Test error class integration
describe('error class integration', () => {
  test('ApiError.toJSON returns correct structure', () => {
    const error = new ApiError('Test message', { status: 500, path: '/test' })
    const json = error.toJSON()

    expect(json.name).toBe('ApiError')
    expect(json.message).toBe('Test message')
    expect(json.details.status).toBe(500)
    expect(json.details.path).toBe('/test')
  })

  test('ApiError.isRetryable returns true for 5xx', () => {
    const error = new ApiError('Test', { status: 500 })
    expect(error.isRetryable()).toBe(true)
  })

  test('ApiError.isRetryable returns false for 4xx', () => {
    const error = new ApiError('Test', { status: 400 })
    expect(error.isRetryable()).toBe(false)
  })

  test('ApiError.isRetryable returns true when no status', () => {
    const error = new ApiError('Test')
    expect(error.isRetryable()).toBe(true)
  })

  test('ApiError.getStatus returns status from details', () => {
    const error = new ApiError('Test', { status: 403 })
    expect(error.getStatus()).toBe(403)
  })

  test('ApiError.getStatus returns undefined when no status', () => {
    const error = new ApiError('Test')
    expect(error.getStatus()).toBeUndefined()
  })

  test('ServerError is retryable', () => {
    const error = new ServerError(500, 'Server error')
    expect(error.isRetryable()).toBe(true)
  })

  test('ClientError is not retryable', () => {
    const error = new ClientError(400, 'Bad request')
    expect(error.isRetryable()).toBe(false)
  })

  test('NetworkError is retryable', () => {
    const error = new NetworkError('Network failed')
    expect(error.isRetryable()).toBe(true)
  })
})
