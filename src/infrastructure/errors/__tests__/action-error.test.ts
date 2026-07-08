import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { ValiError } from 'valibot'

const mockCaptureError = mock()

mock.module('@/infrastructure/sentry/capture', () => ({
  captureError: mockCaptureError,
}))

const {
  createActionError,
  extractErrorCode,
  handleActionError,
  isAlreadyCapturedActionErrorMessage,
  withCapturedActionContext,
} = await import('../action-error')
const { AUTHORIZATION_ERROR, INTERNAL_ERROR, VALIDATION_ERROR } = await import('../codes')

beforeEach(() => {
  mockCaptureError.mockReset()
})

describe('createActionError', () => {
  test('creates error with [CODE] format', () => {
    const error = createActionError(VALIDATION_ERROR, 'createWorkItemAction')
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('[VALIDATION_ERROR] createWorkItemAction')
  })

  test('works with different error codes', () => {
    const error = createActionError(AUTHORIZATION_ERROR, 'assertOwnerRole')
    expect(error.message).toBe('[AUTHORIZATION_ERROR] assertOwnerRole')
  })

  test('works with context containing colons', () => {
    const error = createActionError(INTERNAL_ERROR, 'action: some detail')
    expect(error.message).toBe('[INTERNAL_ERROR] action: some detail')
  })
})

describe('extractErrorCode', () => {
  test('extracts code from [CODE] format', () => {
    expect(extractErrorCode('[VALIDATION_ERROR] createWorkItemAction')).toBe('VALIDATION_ERROR')
  })

  test('extracts different codes', () => {
    expect(extractErrorCode('[INTERNAL_ERROR] something')).toBe('INTERNAL_ERROR')
    expect(extractErrorCode('[AUTHORIZATION_ERROR] assertOwnerRole')).toBe('AUTHORIZATION_ERROR')
    expect(extractErrorCode('[AUTHENTICATION_ERROR] login')).toBe('AUTHENTICATION_ERROR')
  })

  test('returns null for non-coded messages', () => {
    expect(extractErrorCode('Regular error message')).toBeNull()
    expect(extractErrorCode('')).toBeNull()
    expect(extractErrorCode('Some [CODE] in middle')).toBeNull()
  })

  test('returns null for lowercase codes', () => {
    expect(extractErrorCode('[validation_error] test')).toBeNull()
  })

  test('returns null for invalid uppercase codes', () => {
    expect(extractErrorCode('[BANANA_CODE] test')).toBeNull()
    expect(extractErrorCode('[RANDOM_ERROR] test')).toBeNull()
  })
})

describe('handleActionError', () => {
  test('re-throws already-coded errors', () => {
    const codedError = createActionError(VALIDATION_ERROR, 'test')

    expect(() => handleActionError(codedError, 'testAction')).toThrow('[VALIDATION_ERROR] test')
  })

  test('re-throwing a pre-coded error does not capture again', () => {
    const codedError = createActionError(VALIDATION_ERROR, 'test')

    expect(() => handleActionError(codedError, 'testAction')).toThrow()
    expect(mockCaptureError).not.toHaveBeenCalled()
  })

  test('converts ValiError to VALIDATION_ERROR', () => {
    const valiError = new ValiError([
      {
        kind: 'schema',
        type: 'string',
        input: 123,
        expected: 'string',
        received: '123',
        message: 'Invalid type',
        path: undefined,
        issues: undefined,
        lang: undefined,
        abortEarly: undefined,
        abortPipeEarly: undefined,
      },
    ])

    expect(() => handleActionError(valiError, 'testAction')).toThrow(
      '[VALIDATION_ERROR] testAction'
    )
  })

  // Regression test for finding 2: a ValiError maps to VALIDATION_ERROR (400), an expected
  // user-facing outcome — not an incident. It must not be captured to Sentry, and the thrown
  // message must stay unmarked so downstream boundaries don't mistake it for an already-handled
  // 5xx incident.
  test('does not capture a ValiError and leaves its message unmarked', () => {
    const valiError = new ValiError([
      {
        kind: 'schema',
        type: 'string',
        input: 123,
        expected: 'string',
        received: '123',
        message: 'Invalid type',
        path: undefined,
        issues: undefined,
        lang: undefined,
        abortEarly: undefined,
        abortPipeEarly: undefined,
      },
    ])

    try {
      handleActionError(valiError, 'testAction')
      throw new Error('expected handleActionError to throw')
    } catch (error) {
      expect((error as Error).message).toBe('[VALIDATION_ERROR] testAction')
      expect(isAlreadyCapturedActionErrorMessage((error as Error).message)).toBe(false)
    }
    expect(mockCaptureError).not.toHaveBeenCalled()
  })

  test('converts generic Error to INTERNAL_ERROR without leaking message', () => {
    const genericError = new Error('Connection refused')

    expect(() => handleActionError(genericError, 'fetchAction')).toThrow(
      '[INTERNAL_ERROR] fetchAction'
    )
  })

  test('does not include server details in INTERNAL_ERROR message', () => {
    const dbError = new Error('duplicate key value violates unique constraint "work_items_pkey"')

    try {
      handleActionError(dbError, 'createWorkItemAction')
    } catch (error) {
      expect((error as Error).message).toBe('[INTERNAL_ERROR] createWorkItemAction:captured')
      expect((error as Error).message).not.toContain('duplicate key')
    }
  })

  // Regression test for finding 2: a generic uncoded error maps to INTERNAL_ERROR (500) — a
  // genuine incident. handleActionError is the capture boundary for it: captured exactly once,
  // and the thrown message carries the `:captured` marker.
  test('captures a generic uncoded Error exactly once and marks the message', () => {
    const dbError = new Error('duplicate key value violates unique constraint "work_items_pkey"')

    try {
      handleActionError(dbError, 'createWorkItemAction')
      throw new Error('expected handleActionError to throw')
    } catch (error) {
      expect(isAlreadyCapturedActionErrorMessage((error as Error).message)).toBe(true)
    }
    expect(mockCaptureError).toHaveBeenCalledTimes(1)
    expect(mockCaptureError.mock.calls[0]?.[0]).toBe(dbError)
  })

  test('converts non-Error to INTERNAL_ERROR', () => {
    expect(() => handleActionError('string error', 'testAction')).toThrow(
      '[INTERNAL_ERROR] testAction'
    )
  })

  test('converts undefined to INTERNAL_ERROR', () => {
    expect(() => handleActionError(undefined, 'testAction')).toThrow('[INTERNAL_ERROR] testAction')
  })
})

describe('withCapturedActionContext / isAlreadyCapturedActionErrorMessage', () => {
  test('marks a createActionError message as already captured', () => {
    const message = createActionError(
      INTERNAL_ERROR,
      withCapturedActionContext('safeAction')
    ).message

    expect(message).toBe('[INTERNAL_ERROR] safeAction:captured')
    expect(isAlreadyCapturedActionErrorMessage(message)).toBe(true)
  })

  test('does not flag an unmarked message as already captured', () => {
    const message = createActionError(VALIDATION_ERROR, 'safeAction').message

    expect(isAlreadyCapturedActionErrorMessage(message)).toBe(false)
  })

  test('extractErrorCode still resolves the code on a marked message', () => {
    const message = createActionError(
      INTERNAL_ERROR,
      withCapturedActionContext('safeAction')
    ).message

    expect(extractErrorCode(message)).toBe(INTERNAL_ERROR)
  })
})
