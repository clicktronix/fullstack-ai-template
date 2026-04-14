import { describe, expect, mock, test } from 'bun:test'
import { throwIfError, withRetry } from '../throw-supabase-error'

// Хелпер для создания PostgrestError-подобных объектов
const createPostgrestError = (
  overrides: Partial<{
    code: string
    message: string
    details: string
    hint: string
    name: string
  }> = {}
) => ({
  message: overrides.message ?? 'some error',
  details: overrides.details ?? '',
  hint: overrides.hint ?? '',
  code: overrides.code ?? '',
  name: overrides.name ?? 'PostgrestError',
})

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
