import { AuthApiError, type Session } from '@supabase/supabase-js'
import { describe, expect, mock, test } from 'bun:test'
import { UnauthorizedError } from '@/shared/kernel/errors/api-error'
import {
  readCurrentUser,
  readIdentityContext,
  signIn,
  signOut,
  signUp,
  startOAuthSignIn,
  type IdentityAuthEffects,
  type IdentityEffects,
} from './server'

const credential = 'valid-test-credential'
const testUserId = '11111111-1111-4111-8111-111111111111'
const session = {
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: testUserId,
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: '2026-01-01T00:00:00.000Z',
  },
} satisfies Session

const profile = {
  id: testUserId,
  email: 'user@example.com',
  role: 'admin' as const,
  full_name: 'Test User',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

function authEffects(overrides: Partial<IdentityAuthEffects['auth']> = {}): IdentityAuthEffects {
  return {
    auth: {
      signInWithPassword: mock(async () => ({
        data: { session, user: session.user },
        error: null,
      })),
      signUp: mock(async () => ({ data: { session, user: session.user }, error: null })),
      signOut: mock(async () => ({ error: null })),
      signInWithOAuth: mock(async () => ({
        data: { provider: 'google' as const, url: 'https://example.com/oauth' },
        error: null,
      })),
      ...overrides,
    },
  }
}

function identityEffects({
  authError = null,
  profileData = profile,
  profileError = null,
}: {
  authError?: AuthApiError | null
  profileData?: typeof profile | null
  profileError?: {
    code: string
    details: string
    hint: string
    message: string
  } | null
} = {}): IdentityEffects {
  const single = mock(async () => ({ data: profileData, error: profileError }))
  const eq = mock(() => ({ single }))
  const select = mock(() => ({ eq }))

  return {
    supabase: {
      auth: {
        getUser: mock(async () => ({
          data: { user: authError ? null : session.user },
          error: authError,
        })),
      },
      from: mock(() => ({ select })),
    } as never,
  }
}

describe('identity server auth', () => {
  test('signs in through the injected auth provider', async () => {
    const effects = authEffects()
    await expect(
      signIn(effects, { email: 'user@example.com', password: credential })
    ).resolves.toBe(session)
  })

  test('maps a missing session to authentication failure', async () => {
    const effects = authEffects({
      signInWithPassword: mock(async () => ({
        data: { session: null, user: null },
        error: new AuthApiError('Invalid credentials', 400, 'invalid_credentials'),
      })),
    })

    await expect(
      signIn(effects, { email: 'user@example.com', password: credential })
    ).rejects.toBeInstanceOf(UnauthorizedError)
  })

  test('passes signup profile metadata to the provider', async () => {
    const signUpProvider = mock(async () => ({
      data: { session: null, user: session.user },
      error: null,
    }))
    const effects = authEffects({ signUp: signUpProvider })

    await expect(
      signUp(effects, {
        email: 'user@example.com',
        password: credential,
        fullName: 'Ada Lovelace',
      })
    ).resolves.toBeNull()
    expect(signUpProvider).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: credential,
      options: { data: { full_name: 'Ada Lovelace' } },
    })
  })

  test('delegates sign-out and OAuth setup', async () => {
    const effects = authEffects()

    await expect(signOut(effects)).resolves.toBeUndefined()
    await expect(
      startOAuthSignIn(effects, 'google', 'https://app.example.com/auth/callback')
    ).resolves.toEqual({ url: 'https://example.com/oauth' })
  })
})

describe('identity server reads', () => {
  test('resolves product identity from the identity-owned profile', async () => {
    await expect(readIdentityContext(identityEffects(), testUserId)).resolves.toEqual({
      actorId: testUserId,
      role: 'admin',
    })
  })

  test('returns null for an expected missing session', async () => {
    const effects = identityEffects({
      authError: new AuthApiError('Session missing', 401, 'session_not_found'),
    })

    await expect(readCurrentUser(effects)).resolves.toBeNull()
  })

  test('propagates an auth provider outage instead of treating it as anonymous', async () => {
    const error = new AuthApiError('Auth unavailable', 503, 'unexpected_failure')
    await expect(readCurrentUser(identityEffects({ authError: error }))).rejects.toBe(error)
  })

  test('treats an authenticated user without a profile as an incident', async () => {
    const effects = identityEffects({
      profileData: null,
      profileError: {
        code: 'PGRST116',
        details: 'The result contains 0 rows',
        hint: '',
        message: 'JSON object requested, multiple (or no) rows returned',
      },
    })

    await expect(readIdentityContext(effects, testUserId)).rejects.toThrow(
      'Authenticated user profile is missing'
    )
  })
})
