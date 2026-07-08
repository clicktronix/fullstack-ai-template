import { beforeEach, describe, expect, mock, test } from 'bun:test'

const mockCaptureError = mock()

mock.module('@/infrastructure/sentry/capture', () => ({
  captureError: mockCaptureError,
}))

const { createActionError, isAlreadyCapturedActionErrorMessage, withCapturedActionContext } =
  await import('@/infrastructure/errors/action-error')
const { UnauthorizedError, createHttpError } = await import('@/infrastructure/errors/api-error')
const {
  AUTHENTICATION_ERROR,
  DATA_PROVIDER_ERROR,
  INTERNAL_ERROR,
  RATE_LIMIT_EXCEEDED,
  VALIDATION_ERROR,
} = await import('@/infrastructure/errors/codes')
const { actionClient, unwrapSafeActionResult } = await import('../safe-action')

beforeEach(() => {
  mockCaptureError.mockReset()
})

describe('actionClient error mapping', () => {
  test('maps auth API errors to authentication action errors', async () => {
    const action = actionClient.action(async () => {
      throw new UnauthorizedError('Invalid credentials')
    })

    const result = await action()

    expect(result.serverError).toStartWith(`[${AUTHENTICATION_ERROR}]`)
    expect(() => unwrapSafeActionResult(result)).toThrow(`[${AUTHENTICATION_ERROR}]`)
    // Expected, user-facing outcome — not an incident, not captured.
    expect(mockCaptureError).not.toHaveBeenCalled()
  })

  test('maps client validation HTTP errors to validation action errors', async () => {
    const action = actionClient.action(async () => {
      throw createHttpError(400, 'Invalid signup input')
    })

    const result = await action()

    expect(result.serverError).toStartWith(`[${VALIDATION_ERROR}]`)
    expect(mockCaptureError).not.toHaveBeenCalled()
  })

  test('preserves already-coded action errors without capturing (captured at their own origin)', async () => {
    const action = actionClient.action(async () => {
      throw createActionError(VALIDATION_ERROR, 'testAction')
    })

    const result = await action()

    expect(result.serverError).toBe(`[${VALIDATION_ERROR}] testAction`)
    expect(mockCaptureError).not.toHaveBeenCalled()
  })

  test('keeps generic errors internal, captures the incident exactly once, and marks the message as already captured', async () => {
    const action = actionClient.action(async () => {
      throw new Error('database connection detail')
    })

    const result = await action()

    expect(result.serverError).toBe(`[${INTERNAL_ERROR}] safeAction:captured`)
    expect(mockCaptureError).toHaveBeenCalledTimes(1)
    // Regression guard for the query-client double-capture fix: the rethrown client-side error
    // (unwrapSafeActionResult wraps result.serverError in `new Error(...)`) must be recognized
    // as already-captured so QueryCache.onError doesn't report the same incident twice.
    expect(isAlreadyCapturedActionErrorMessage(result.serverError ?? '')).toBe(true)
    expect(() => unwrapSafeActionResult(result)).toThrow(`[${INTERNAL_ERROR}] safeAction:captured`)
  })

  test('captures an unexpected 5xx ApiError (HTTP_ERROR) exactly once and marks the message as already captured', async () => {
    const upstream = createHttpError(502, 'Bad gateway')
    const action = actionClient.action(async () => {
      throw upstream
    })

    const result = await action()

    expect(mockCaptureError).toHaveBeenCalledTimes(1)
    expect(mockCaptureError.mock.calls[0]?.[0]).toBe(upstream)
    expect(mockCaptureError.mock.calls[0]?.[1]).toEqual({ tags: { boundary: 'safe-action' } })
    expect(isAlreadyCapturedActionErrorMessage(result.serverError ?? '')).toBe(true)
  })

  test('expected outcomes (validation/auth/rate-limit) are not marked as already captured', async () => {
    const action = actionClient.action(async () => {
      throw new UnauthorizedError('Invalid credentials')
    })

    const result = await action()

    expect(mockCaptureError).not.toHaveBeenCalled()
    expect(isAlreadyCapturedActionErrorMessage(result.serverError ?? '')).toBe(false)
  })
})

// Regression tests for Codex round-2 blocking finding: 5xx-mapped BACKEND-coded ApiErrors
// (DATA_PROVIDER_ERROR -> 502, etc.) and unmarked pre-coded 5xx action errors were returned
// without any Sentry capture - mutations lost the incident entirely. Any code mapping to a
// 5xx must be captured exactly once at this boundary and marked; 4xx codes stay uncaptured.
describe('actionClient 5xx-coded capture (once-only invariant)', () => {
  test('captures a backend-coded 5xx ApiError exactly once and marks the message', async () => {
    const upstream = createHttpError(502, 'provider exploded', { errorCode: DATA_PROVIDER_ERROR })
    const action = actionClient.action(async () => {
      throw upstream
    })

    const result = await action()

    expect(result.serverError).toStartWith(`[${DATA_PROVIDER_ERROR}]`)
    expect(mockCaptureError).toHaveBeenCalledTimes(1)
    expect(mockCaptureError.mock.calls[0]?.[0]).toBe(upstream)
    expect(isAlreadyCapturedActionErrorMessage(result.serverError ?? '')).toBe(true)
  })

  test('does not capture a backend-coded 4xx ApiError (rate limit) and leaves it unmarked', async () => {
    const action = actionClient.action(async () => {
      throw createHttpError(429, 'slow down', { errorCode: RATE_LIMIT_EXCEEDED })
    })

    const result = await action()

    expect(result.serverError).toStartWith(`[${RATE_LIMIT_EXCEEDED}]`)
    expect(mockCaptureError).not.toHaveBeenCalled()
    expect(isAlreadyCapturedActionErrorMessage(result.serverError ?? '')).toBe(false)
  })

  test('captures an unmarked pre-coded 5xx action error once and marks it', async () => {
    const action = actionClient.action(async () => {
      throw createActionError(DATA_PROVIDER_ERROR, 'useCaseOrigin')
    })

    const result = await action()

    expect(mockCaptureError).toHaveBeenCalledTimes(1)
    expect(isAlreadyCapturedActionErrorMessage(result.serverError ?? '')).toBe(true)
  })

  test('does not re-capture an already-marked pre-coded 5xx action error', async () => {
    const action = actionClient.action(async () => {
      throw createActionError(INTERNAL_ERROR, withCapturedActionContext('origin'))
    })

    const result = await action()

    expect(mockCaptureError).not.toHaveBeenCalled()
    expect(isAlreadyCapturedActionErrorMessage(result.serverError ?? '')).toBe(true)
  })
})
