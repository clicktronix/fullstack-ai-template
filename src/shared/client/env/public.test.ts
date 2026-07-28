import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { getPublicSupabaseKey, getRequiredPublicSupabaseKey } from './public'

const SUPABASE_ENV_KEYS = [
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const

let originalEnv: Record<string, string | undefined>

beforeEach(() => {
  originalEnv = Object.fromEntries(SUPABASE_ENV_KEYS.map((key) => [key, process.env[key]]))
  for (const key of SUPABASE_ENV_KEYS) delete process.env[key]
})

afterEach(() => {
  for (const key of SUPABASE_ENV_KEYS) {
    const value = originalEnv[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

describe('getPublicSupabaseKey', () => {
  test('prefers the new publishable key when both are set', () => {
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'new-publishable-key'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'legacy-anon-key'
    expect(getPublicSupabaseKey()).toBe('new-publishable-key')
  })

  test('falls back to the legacy anon key', () => {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'legacy-anon-key'
    expect(getPublicSupabaseKey()).toBe('legacy-anon-key')
  })

  test('returns undefined when neither key is set', () => {
    expect(getPublicSupabaseKey()).toBeUndefined()
  })

  // Regression test: .env.example ships a blank `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=` line as
  // a template. Before the fix, `'' ?? legacyKey` returned '' (empty string wins over `??`)
  // instead of falling back to the legacy anon key.
  test('new key empty string + legacy set → legacy used', () => {
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = ''
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'legacy-anon-key'
    expect(getPublicSupabaseKey()).toBe('legacy-anon-key')
  })
})

describe('getRequiredPublicSupabaseKey', () => {
  test('throws when neither key is set', () => {
    expect(() => getRequiredPublicSupabaseKey()).toThrow()
  })
})
