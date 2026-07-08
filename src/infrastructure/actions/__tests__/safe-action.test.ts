import { beforeEach, describe, expect, mock, test } from 'bun:test'

const mockCaptureError = mock()

mock.module('@/infrastructure/sentry/capture', () => ({
  captureError: mockCaptureError,
}))

const { createActionError } = await import('@/infrastructure/errors/action-error')
const { UnauthorizedError, createHttpError } = await import('@/infrastructure/errors/api-error')
const { AUTHENTICATION_ERROR, INTERNAL_ERROR, VALIDATION_ERROR } =
  await import('@/infrastructure/errors/codes')
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

  test('keeps generic errors internal and captures the incident exactly once', async () => {
    const action = actionClient.action(async () => {
      throw new Error('database connection detail')
    })

    const result = await action()

    expect(result.serverError).toBe(`[${INTERNAL_ERROR}] safeAction`)
    expect(mockCaptureError).toHaveBeenCalledTimes(1)
  })

  test('captures an unexpected 5xx ApiError (HTTP_ERROR) exactly once', async () => {
    const upstream = createHttpError(502, 'Bad gateway')
    const action = actionClient.action(async () => {
      throw upstream
    })

    await action()

    expect(mockCaptureError).toHaveBeenCalledTimes(1)
    expect(mockCaptureError.mock.calls[0]?.[0]).toBe(upstream)
    expect(mockCaptureError.mock.calls[0]?.[1]).toEqual({ tags: { boundary: 'safe-action' } })
  })
})
