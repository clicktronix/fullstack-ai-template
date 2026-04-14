import type { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js'
import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { User } from '@/domain/user/user'

// Test credentials - safe for tests only (NOSONAR)
const TEST_EMAIL = 'test@example.com'
const TEST_NEW_EMAIL = 'new@example.com'
const TEST_EXISTING_EMAIL = 'existing@example.com'
const TEST_SECRET = 'test-secret-123' // NOSONAR
const TEST_WRONG_SECRET = 'wrong-secret' // NOSONAR

// Mock user data
const mockSupabaseUser: SupabaseUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: TEST_EMAIL,
  aud: 'authenticated',
  role: 'authenticated',
  created_at: '2024-01-15T10:30:00.000Z',
  updated_at: '2024-01-15T10:30:00.000Z',
  app_metadata: {},
  user_metadata: { full_name: 'Test User' },
}

const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockSupabaseUser,
}

const mockPublicUser: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: TEST_EMAIL,
  role: 'admin',
  full_name: 'Test User',
  created_at: '2024-01-15T10:30:00.000Z',
  updated_at: '2024-01-15T10:30:00.000Z',
}

const mockSignInWithPassword = mock<() => Promise<unknown>>(() =>
  Promise.resolve({ data: { session: mockSession, user: mockSupabaseUser }, error: null })
)
const mockSignUp = mock<() => Promise<unknown>>(() =>
  Promise.resolve({ data: { session: mockSession, user: mockSupabaseUser }, error: null })
)
const mockSignOut = mock<() => Promise<unknown>>(() => Promise.resolve({ error: null }))
const mockGetSession = mock<() => Promise<unknown>>(() =>
  Promise.resolve({ data: { session: mockSession }, error: null })
)
const mockUnsubscribe = mock(() => {})
const mockOnAuthStateChange = mock(() => ({
  data: {
    subscription: {
      id: 'mock-subscription-id',
      callback: mock(() => {}),
      unsubscribe: mockUnsubscribe,
    },
  },
}))

const mockSingle = mock<() => Promise<unknown>>(() =>
  Promise.resolve({ data: mockPublicUser, error: null })
)
const mockEq = mock(() => ({ single: mockSingle }))
const mockSelect = mock(() => ({ eq: mockEq }))
const mockFrom = mock(() => ({ select: mockSelect }))

mock.module('@/adapters/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: mockFrom,
  },
}))

type AuthModule = typeof import('../auth')

let authApi: AuthModule

async function loadAuthModule(): Promise<AuthModule> {
  return import(`../auth?test=${Date.now()}-${Math.random()}`)
}

beforeEach(async () => {
  mockSignInWithPassword.mockClear()
  mockSignUp.mockClear()
  mockSignOut.mockClear()
  mockGetSession.mockClear()
  mockOnAuthStateChange.mockClear()
  mockFrom.mockClear()
  mockSelect.mockClear()
  mockEq.mockClear()
  mockSingle.mockClear()

  mockSignInWithPassword.mockImplementation(() =>
    Promise.resolve({ data: { session: mockSession, user: mockSupabaseUser }, error: null })
  )
  mockSignUp.mockImplementation(() =>
    Promise.resolve({ data: { session: mockSession, user: mockSupabaseUser }, error: null })
  )
  mockSignOut.mockImplementation(() => Promise.resolve({ error: null }))
  mockGetSession.mockImplementation(() =>
    Promise.resolve({ data: { session: mockSession }, error: null })
  )
  mockSingle.mockImplementation(() => Promise.resolve({ data: mockPublicUser, error: null }))
  mockEq.mockImplementation(() => ({ single: mockSingle }))
  mockSelect.mockImplementation(() => ({ eq: mockEq }))
  mockFrom.mockImplementation(() => ({ select: mockSelect }))

  authApi = await loadAuthModule()
})

describe('signIn', () => {
  test('signs in user with email and secret', async () => {
    const result = await authApi.signIn(TEST_EMAIL, TEST_SECRET)

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: TEST_EMAIL,
      password: TEST_SECRET,
    })
    expect(result).toEqual(mockSession)
  })

  test('throws error when authentication fails', async () => {
    mockSignInWithPassword.mockImplementationOnce(() =>
      Promise.resolve({
        data: { session: null, user: null },
        error: { message: 'Invalid credentials', status: 401 },
      })
    )

    await expect(authApi.signIn(TEST_EMAIL, TEST_WRONG_SECRET)).rejects.toThrow(
      'Sign in failed: Invalid credentials'
    )
  })

  test('throws error when no session returned', async () => {
    mockSignInWithPassword.mockImplementationOnce(() =>
      Promise.resolve({
        data: { session: null, user: mockSupabaseUser },
        error: null,
      })
    )

    await expect(authApi.signIn(TEST_EMAIL, TEST_SECRET)).rejects.toThrow(
      'Sign in failed: No session returned'
    )
  })
})

describe('signUp', () => {
  test('signs up user with email and secret', async () => {
    const result = await authApi.signUp(TEST_NEW_EMAIL, TEST_SECRET)

    expect(mockSignUp).toHaveBeenCalledWith({
      email: TEST_NEW_EMAIL,
      password: TEST_SECRET,
      options: {
        data: {
          full_name: undefined,
        },
      },
    })
    expect(result).toEqual(mockSession)
  })

  test('signs up user with full name', async () => {
    const result = await authApi.signUp(TEST_NEW_EMAIL, TEST_SECRET, 'John Doe')

    expect(mockSignUp).toHaveBeenCalledWith({
      email: TEST_NEW_EMAIL,
      password: TEST_SECRET,
      options: {
        data: {
          full_name: 'John Doe',
        },
      },
    })
    expect(result).toEqual(mockSession)
  })

  test('returns null session when email confirmation required', async () => {
    mockSignUp.mockImplementationOnce(() =>
      Promise.resolve({
        data: { session: null, user: mockSupabaseUser },
        error: null,
      })
    )

    const result = await authApi.signUp(TEST_NEW_EMAIL, TEST_SECRET)

    expect(result).toBeNull()
  })

  test('throws error when registration fails', async () => {
    mockSignUp.mockImplementationOnce(() =>
      Promise.resolve({
        data: { session: null, user: null },
        error: { message: 'Email already registered', status: 400 },
      })
    )

    await expect(authApi.signUp(TEST_EXISTING_EMAIL, TEST_SECRET)).rejects.toThrow(
      'Sign up failed: Email already registered'
    )
  })
})

describe('signOut', () => {
  test('signs out user successfully', async () => {
    await authApi.signOut()

    expect(mockSignOut).toHaveBeenCalled()
  })

  test('throws error when sign out fails', async () => {
    mockSignOut.mockImplementationOnce(() =>
      Promise.resolve({ error: { message: 'Sign out failed', status: 500 } })
    )

    await expect(authApi.signOut()).rejects.toThrow('Sign out failed: Sign out failed')
  })
})

describe('getSession', () => {
  test('returns current session', async () => {
    const result = await authApi.getSession()

    expect(mockGetSession).toHaveBeenCalled()
    expect(result).toEqual(mockSession)
  })

  test('returns null when no session', async () => {
    mockGetSession.mockImplementationOnce(() =>
      Promise.resolve({ data: { session: null }, error: null })
    )

    const result = await authApi.getSession()

    expect(result).toBeNull()
  })

  test('throws error when session retrieval fails', async () => {
    mockGetSession.mockImplementationOnce(() =>
      Promise.resolve({
        data: { session: null },
        error: { message: 'Session expired', status: 401 },
      })
    )

    await expect(authApi.getSession()).rejects.toThrow('Failed to get session: Session expired')
  })
})

describe('getCurrentUser', () => {
  test('returns user from public.users table', async () => {
    const result = await authApi.getCurrentUser()

    expect(mockGetSession).toHaveBeenCalled()
    expect(mockFrom).toHaveBeenCalledWith('users')
    expect(result).toEqual(mockPublicUser)
  })

  test('returns null when no session', async () => {
    mockGetSession.mockImplementationOnce(() =>
      Promise.resolve({ data: { session: null }, error: null })
    )

    const result = await authApi.getCurrentUser()

    expect(result).toBeNull()
    expect(mockFrom).not.toHaveBeenCalled()
  })

  test('throws error when session retrieval fails', async () => {
    mockGetSession.mockImplementationOnce(() =>
      Promise.resolve({
        data: { session: null },
        error: { message: 'Session error', status: 401 },
      })
    )

    await expect(authApi.getCurrentUser()).rejects.toThrow('Failed to get session: Session error')
  })

  test('throws error when user query fails', async () => {
    mockSingle.mockImplementationOnce(() =>
      Promise.resolve({ data: null, error: { message: 'User not found', status: 404 } })
    )

    await expect(authApi.getCurrentUser()).rejects.toThrow('Failed to get user: User not found')
  })
})

describe('onAuthStateChange', () => {
  test('subscribes to auth state changes', () => {
    const callback = mock((_event: AuthChangeEvent, _session: Session | null) => {})

    const subscription = authApi.onAuthStateChange(callback)

    expect(mockOnAuthStateChange).toHaveBeenCalled()
    expect(subscription).toHaveProperty('unsubscribe')
  })

  test('returns subscription with unsubscribe method', () => {
    const callback = mock((_event: AuthChangeEvent, _session: Session | null) => {})

    const subscription = authApi.onAuthStateChange(callback)

    expect(typeof subscription.unsubscribe).toBe('function')
  })
})
