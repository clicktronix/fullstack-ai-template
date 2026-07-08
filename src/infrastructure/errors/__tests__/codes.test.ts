import { describe, expect, test } from 'bun:test'
import {
  // Error codes
  AUTHENTICATION_ERROR,
  AUTHORIZATION_ERROR,
  CONNECTION_ERROR,
  DATA_FETCH_ERROR,
  DATA_PROVIDER_ERROR,
  INTERNAL_ERROR,
  RATE_LIMIT_EXCEEDED,
  TIMEOUT,
  UNKNOWN_ERROR,
  VALIDATION_ERROR,
  // Utility functions
  isAuthErrorCode,
  isRateLimitErrorCode,
  isRetryableErrorCode,
  isValidErrorCode,
} from '../codes'

describe('isRetryableErrorCode', () => {
  test('returns true for data fetch errors', () => {
    expect(isRetryableErrorCode(DATA_FETCH_ERROR)).toBe(true)
  })

  test('returns true for data provider errors', () => {
    expect(isRetryableErrorCode(DATA_PROVIDER_ERROR)).toBe(true)
  })

  test('returns true for rate limit errors', () => {
    expect(isRetryableErrorCode(RATE_LIMIT_EXCEEDED)).toBe(true)
  })

  test('returns true for connection errors', () => {
    expect(isRetryableErrorCode(CONNECTION_ERROR)).toBe(true)
  })

  test('returns true for timeout errors', () => {
    expect(isRetryableErrorCode(TIMEOUT)).toBe(true)
  })

  test('returns false for validation errors', () => {
    expect(isRetryableErrorCode(VALIDATION_ERROR)).toBe(false)
  })

  test('returns false for auth errors', () => {
    expect(isRetryableErrorCode(AUTHENTICATION_ERROR)).toBe(false)
    expect(isRetryableErrorCode(AUTHORIZATION_ERROR)).toBe(false)
  })

  test('returns false for internal errors (permanent, not transient)', () => {
    expect(isRetryableErrorCode(INTERNAL_ERROR)).toBe(false)
  })

  test('returns false for unknown codes', () => {
    expect(isRetryableErrorCode('UNKNOWN_CODE')).toBe(false)
    expect(isRetryableErrorCode('')).toBe(false)
  })
})

describe('isRateLimitErrorCode', () => {
  test('returns true for rate limit exceeded', () => {
    expect(isRateLimitErrorCode(RATE_LIMIT_EXCEEDED)).toBe(true)
  })

  test('returns false for non-rate-limit errors', () => {
    expect(isRateLimitErrorCode(DATA_FETCH_ERROR)).toBe(false)
    expect(isRateLimitErrorCode(VALIDATION_ERROR)).toBe(false)
    expect(isRateLimitErrorCode(AUTHENTICATION_ERROR)).toBe(false)
    expect(isRateLimitErrorCode(CONNECTION_ERROR)).toBe(false)
  })

  test('returns false for unknown codes', () => {
    expect(isRateLimitErrorCode('UNKNOWN_CODE')).toBe(false)
    expect(isRateLimitErrorCode('')).toBe(false)
  })
})

describe('isAuthErrorCode', () => {
  test('returns true for authentication error', () => {
    expect(isAuthErrorCode(AUTHENTICATION_ERROR)).toBe(true)
  })

  test('returns true for authorization error', () => {
    expect(isAuthErrorCode(AUTHORIZATION_ERROR)).toBe(true)
  })

  test('returns false for non-auth errors', () => {
    expect(isAuthErrorCode(RATE_LIMIT_EXCEEDED)).toBe(false)
    expect(isAuthErrorCode(VALIDATION_ERROR)).toBe(false)
    expect(isAuthErrorCode(DATA_FETCH_ERROR)).toBe(false)
  })

  test('returns false for unknown codes', () => {
    expect(isAuthErrorCode('UNKNOWN_CODE')).toBe(false)
    expect(isAuthErrorCode('')).toBe(false)
  })
})

describe('isValidErrorCode', () => {
  test('returns true for all known error codes', () => {
    expect(isValidErrorCode(INTERNAL_ERROR)).toBe(true)
    expect(isValidErrorCode(VALIDATION_ERROR)).toBe(true)
    expect(isValidErrorCode(AUTHENTICATION_ERROR)).toBe(true)
    expect(isValidErrorCode(AUTHORIZATION_ERROR)).toBe(true)
    expect(isValidErrorCode(RATE_LIMIT_EXCEEDED)).toBe(true)
    expect(isValidErrorCode(DATA_FETCH_ERROR)).toBe(true)
    expect(isValidErrorCode(DATA_PROVIDER_ERROR)).toBe(true)
    expect(isValidErrorCode(CONNECTION_ERROR)).toBe(true)
    expect(isValidErrorCode(TIMEOUT)).toBe(true)
    expect(isValidErrorCode(UNKNOWN_ERROR)).toBe(true)
  })

  test('returns false for invalid codes', () => {
    expect(isValidErrorCode('BANANA_CODE')).toBe(false)
    expect(isValidErrorCode('RANDOM_ERROR')).toBe(false)
    expect(isValidErrorCode('')).toBe(false)
    expect(isValidErrorCode('validation_error')).toBe(false)
  })
})
