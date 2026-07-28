import { PostgrestError } from '@supabase/supabase-js'
import { describe, expect, mock, test } from 'bun:test'
import { ApiError, ClientError, NotFoundError, ServerError } from '@/shared/kernel/errors/api-error'
import { throwIfError, withRetry } from './throw-supabase-error'

// Helper for creating PostgrestError-like objects.
const createPostgrestError = (
  overrides: Partial<{
    code: string
    message: string
    details: string
    hint: string
    name: string
  }> = {}
) => {
  const error = new PostgrestError({
    message: overrides.message ?? 'some error',
    details: overrides.details ?? '',
    hint: overrides.hint ?? '',
    code: overrides.code ?? '',
  })
  if (overrides.name) {
    error.name = overrides.name
  }
  return error
}

describe('throwIfError', () => {
  test('does not throw when error is null', () => {
    expect(() => throwIfError(null, 'test operation')).not.toThrow()
  })

  test('throws with sanitized message for transient error', () => {
    const error = createPostgrestError({ code: '42P05', message: 'prepared statement exists' })
    expect(() => throwIfError(error, 'get work items')).toThrow(
      'Failed to get work items: temporary database issue, please try again'
    )
  })

  test('throws with original message for non-transient error', () => {
    const error = createPostgrestError({ code: '23505', message: 'duplicate key value' })
    expect(() => throwIfError(error, 'create work item')).toThrow(
      'Failed to create work item: duplicate key value'
    )
  })

  test('throws with sanitized message for pgbouncer message pattern', () => {
    const error = createPostgrestError({ message: 'pgbouncer cannot connect' })
    expect(() => throwIfError(error, 'get data')).toThrow(
      'Failed to get data: temporary database issue, please try again'
    )
  })

  test('throws with sanitized message for "too many clients" pattern', () => {
    const error = createPostgrestError({ message: 'too many clients already' })
    expect(() => throwIfError(error, 'get data')).toThrow(
      'Failed to get data: temporary database issue, please try again'
    )
  })

  test('throws a typed ApiError (not a generic Error) for any Postgrest failure', () => {
    const error = createPostgrestError({ code: '42501', message: 'permission denied' })
    expect(() => throwIfError(error, 'get labels')).toThrow(ApiError)
  })

  test('maps an unclassified/transient Postgrest error to a 500 ServerError', () => {
    const error = createPostgrestError({ code: '42P05', message: 'prepared statement exists' })
    try {
      throwIfError(error, 'get work items')
      throw new Error('expected throwIfError to throw')
    } catch (error_) {
      expect(error_).toBeInstanceOf(ServerError)
      expect((error_ as ApiError).getStatus()).toBe(500)
      expect((error_ as ApiError).isRetryable()).toBe(true)
    }
  })

  test('maps a unique_violation (23505) to a 409 ClientError', () => {
    const error = createPostgrestError({ code: '23505', message: 'duplicate key value' })
    try {
      throwIfError(error, 'create work item')
      throw new Error('expected throwIfError to throw')
    } catch (error_) {
      expect(error_).toBeInstanceOf(ClientError)
      expect((error_ as ApiError).getStatus()).toBe(409)
    }
  })

  test('maps a PGRST116 (no rows) error to a 404 NotFoundError', () => {
    const error = createPostgrestError({ code: 'PGRST116', message: 'no rows returned' })
    try {
      throwIfError(error, 'get work item')
      throw new Error('expected throwIfError to throw')
    } catch (error_) {
      expect(error_).toBeInstanceOf(NotFoundError)
      expect((error_ as ApiError).getStatus()).toBe(404)
    }
  })
})

describe('withRetry', () => {
  test('success on first try returns result, fn called once', async () => {
    const fn = mock(() => Promise.resolve('data'))

    const result = await withRetry(fn, 'test')

    expect(result).toBe('data')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('transient error then success returns result, fn called twice', async () => {
    let attempt = 0
    const fn = mock(() => {
      attempt++
      if (attempt === 1) {
        return Promise.reject(new Error('pgbouncer connection reset'))
      }
      return Promise.resolve('recovered')
    })

    const result = await withRetry(fn, 'test')

    expect(result).toBe('recovered')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  test('non-transient error throws immediately, fn called once', async () => {
    const fn = mock(() => Promise.reject(new Error('duplicate key value')))

    await expect(withRetry(fn, 'test')).rejects.toThrow('duplicate key value')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('all retries exhausted throws last error', async () => {
    const fn = mock(() => Promise.reject(new Error('connection reset by peer')))

    await expect(withRetry(fn, 'test', 2)).rejects.toThrow('connection reset by peer')
    expect(fn).toHaveBeenCalledTimes(3)
  })
})
