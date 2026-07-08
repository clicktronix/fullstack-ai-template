import { describe, expect, test } from 'bun:test'
import { redactSensitiveData } from '../log-redaction'

describe('redactSensitiveData', () => {
  test('redacts sensitive top-level and nested keys', () => {
    const redacted = redactSensitiveData({
      email: 'user@example.com',
      headers: {
        authorization: 'Bearer token',
        cookie: 'session=value',
      },
      nested: {
        refresh_token: 'refresh',
        safe: 'visible',
      },
    })

    expect(redacted).toEqual({
      email: 'user@example.com',
      headers: {
        authorization: '[Redacted]',
        cookie: '[Redacted]',
      },
      nested: {
        refresh_token: '[Redacted]',
        safe: 'visible',
      },
    })
  })

  test('redacts sensitive keys inside arrays', () => {
    const redacted = redactSensitiveData([
      { token: 'one', value: 1 },
      { apiKey: 'two', value: 2 },
    ])

    expect(redacted).toEqual([
      { token: '[Redacted]', value: 1 },
      { apiKey: '[Redacted]', value: 2 },
    ])
  })
})
