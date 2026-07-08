import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { getServerEnv, getSupabasePublishableKey, getSupabaseSecretKey } from '../server'

const SUPABASE_ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SECRET_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_SECRET_KEY',
  'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY',
] as const

let originalEnv: Record<string, string | undefined>

beforeEach(() => {
  originalEnv = Object.fromEntries(SUPABASE_ENV_KEYS.map((key) => [key, process.env[key]]))
  for (const key of SUPABASE_ENV_KEYS) delete process.env[key]
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
})

afterEach(() => {
  for (const key of SUPABASE_ENV_KEYS) {
    const value = originalEnv[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

describe('getSupabasePublishableKey', () => {
  test('prefers the new publishable key when both are set', () => {
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'new-publishable-key'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'legacy-anon-key'
    expect(getSupabasePublishableKey()).toBe('new-publishable-key')
  })

  test('falls back to the legacy anon key', () => {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'legacy-anon-key'
    expect(getSupabasePublishableKey()).toBe('legacy-anon-key')
  })

  test('throws when neither key is set', () => {
    expect(() => getSupabasePublishableKey()).toThrow()
  })
})

describe('getSupabaseSecretKey', () => {
  test('prefers the new secret key when both are set', () => {
    process.env.SUPABASE_SECRET_KEY = 'new-secret-key'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'legacy-service-role-key'
    expect(getSupabaseSecretKey()).toBe('new-secret-key')
  })

  test('falls back to the legacy service role key', () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'legacy-service-role-key'
    expect(getSupabaseSecretKey()).toBe('legacy-service-role-key')
  })

  test('throws when neither key is set', () => {
    expect(() => getSupabaseSecretKey()).toThrow()
  })
})

describe('assertNoPublicSecrets', () => {
  test('throws when the new secret key is exposed with a NEXT_PUBLIC_ prefix', () => {
    process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY = 'leaked-secret-key'
    expect(() => getServerEnv()).toThrow(
      'SUPABASE_SECRET_KEY must never use the NEXT_PUBLIC_ prefix'
    )
  })

  test('throws when the legacy service role key is exposed with a NEXT_PUBLIC_ prefix', () => {
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = 'leaked-service-role-key'
    expect(() => getServerEnv()).toThrow(
      'SUPABASE_SERVICE_ROLE_KEY must never use the NEXT_PUBLIC_ prefix'
    )
  })
})
