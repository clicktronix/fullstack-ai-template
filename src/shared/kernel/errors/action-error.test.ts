import { describe, expect, test } from 'bun:test'
import {
  createActionError,
  extractErrorCode,
  isAlreadyCapturedActionErrorMessage,
  withCapturedActionContext,
} from './action-error'
import { INTERNAL_ERROR, VALIDATION_ERROR } from './codes'

describe('action error contract', () => {
  test('encodes and extracts a known error code', () => {
    const error = createActionError(VALIDATION_ERROR, 'createWorkItem')

    expect(error.message).toBe('[VALIDATION_ERROR] createWorkItem')
    expect(extractErrorCode(error.message)).toBe(VALIDATION_ERROR)
  })

  test('rejects unknown and misplaced error codes', () => {
    expect(extractErrorCode('[BANANA_CODE] test')).toBeNull()
    expect(extractErrorCode('Some [VALIDATION_ERROR] in middle')).toBeNull()
  })

  test('marks errors captured at an outer runtime boundary', () => {
    const error = createActionError(INTERNAL_ERROR, withCapturedActionContext('safeAction'))

    expect(error.message).toBe('[INTERNAL_ERROR] safeAction:captured')
    expect(isAlreadyCapturedActionErrorMessage(error.message)).toBe(true)
  })
})
