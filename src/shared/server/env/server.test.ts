import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import {
  getServerEnv,
  getSupabasePublishableKey,
  getSupabaseSecretKey,
  getSupabaseUrl,
} from './server'

const SUPABASE_ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
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

  // Regression test: .env.example ships a blank `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=` line as
  // a template. Before the fix, that blank '' value failed minLength(1) validation before the
  // legacy fallback ever ran.
  test('new key empty string + legacy set → legacy used', () => {
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = ''
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'legacy-anon-key'
    expect(getSupabasePublishableKey()).toBe('legacy-anon-key')
  })
})

// Regression tests for finding 8: `admin.ts` and `server.ts` (SSR client) each defined their
// own private `getSupabaseUrl()` with divergent precedence — admin preferred `SUPABASE_URL`
// over `NEXT_PUBLIC_SUPABASE_URL`, the SSR client only ever read the public URL. If
// `SUPABASE_URL` were set, the two clients could target different hosts. Both now import this
// single accessor.
describe('getSupabaseUrl', () => {
  // getSupabaseUrl doesn't care about the browser key — set a baseline so the schema-level
  // "at least one browser key" check (finding 4) doesn't fail these unrelated assertions.
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'baseline-anon-key'
  })

  test('falls back to the public URL when SUPABASE_URL is not set', () => {
    expect(getSupabaseUrl()).toBe('https://test.supabase.co')
  })

  test('prefers the private SUPABASE_URL over the public URL when both are set', () => {
    process.env.SUPABASE_URL = 'https://private.supabase.internal'
    expect(getSupabaseUrl()).toBe('https://private.supabase.internal')
  })
})

describe('getSupabaseSecretKey', () => {
  // getSupabaseSecretKey doesn't care about the browser key — set a baseline so the
  // schema-level "at least one browser key" check (finding 4) doesn't fail these unrelated
  // assertions.
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'baseline-anon-key'
  })

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

  // Regression test: .env.example ships a blank `SUPABASE_SECRET_KEY=` line as a template.
  test('new key empty string + legacy set → legacy used', () => {
    process.env.SUPABASE_SECRET_KEY = ''
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'legacy-service-role-key'
    expect(getSupabaseSecretKey()).toBe('legacy-service-role-key')
  })
})

// Regression tests for finding 4: before the publishable/secret key migration,
// NEXT_PUBLIC_SUPABASE_ANON_KEY was a required schema field, so getServerEnv() failed fast at
// boot when it was missing. Making both the publishable and legacy anon keys `optional()`
// lost that fail-fast — parse() would succeed even with neither set, deferring the failure to
// whenever a caller happened to invoke getSupabasePublishableKey(). The schema-level `check`
// on ServerEnvSchema restores boot-time fail-fast while still accepting either key name.
describe('ServerEnvSchema cross-field check (browser Supabase key)', () => {
  test('throws at parse time when neither the publishable nor the legacy anon key is set', () => {
    expect(() => getServerEnv()).toThrow()
  })

  test('parses successfully when only the publishable key is set', () => {
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'new-publishable-key'
    expect(() => getServerEnv()).not.toThrow()
  })

  test('parses successfully when only the legacy anon key is set', () => {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'legacy-anon-key'
    expect(() => getServerEnv()).not.toThrow()
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
