import { describe, expect, test } from 'bun:test'
import { redactSensitiveData } from './redact'

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

  // Regression test: the new Supabase secret key (SUPABASE_SECRET_KEY, successor to
  // SUPABASE_SERVICE_ROLE_KEY) must be redacted under its own key names too.
  test('redacts the new Supabase secret key names', () => {
    const redacted = redactSensitiveData({
      secret_key: 'sb_secret_abc123',
      supabase_secret_key: 'sb_secret_abc123',
      safe: 'visible',
    })

    expect(redacted).toEqual({
      secret_key: '[Redacted]',
      supabase_secret_key: '[Redacted]',
      safe: 'visible',
    })
  })

  test('does not redact the publishable key (public by design)', () => {
    const redacted = redactSensitiveData({
      supabase_publishable_key: 'sb_publishable_abc123',
    })

    expect(redacted).toEqual({
      supabase_publishable_key: 'sb_publishable_abc123',
    })
  })
})
