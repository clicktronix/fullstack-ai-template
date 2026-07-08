import { describe, expect, test } from 'bun:test'
import { ValiError } from 'valibot'
import { createActionError, extractErrorCode, handleActionError } from '../action-error'
import { AUTHORIZATION_ERROR, INTERNAL_ERROR, VALIDATION_ERROR } from '../codes'

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
      expect((error as Error).message).toBe('[INTERNAL_ERROR] createWorkItemAction')
      expect((error as Error).message).not.toContain('duplicate key')
    }
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
