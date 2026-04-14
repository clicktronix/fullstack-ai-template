/**
 * Supabase Client Mocks for Testing
 *
 * This module provides mock implementations for Supabase client
 * to use in unit tests without making actual API calls.
 *
 * Usage:
 * ```typescript
 * import { createMockSupabaseClient, mockSupabaseResponse } from '@/tests/mocks/supabase'
 *
 * const mockClient = createMockSupabaseClient()
 * mockSupabaseResponse(mockClient, 'select', { data: [...], error: null })
 * ```
 */

import { mock } from 'bun:test'

// Types for Supabase-like responses
type SupabaseResponse<T> = {
  data: T | null
  error: SupabaseError | null
  count?: number | null
  status?: number
  statusText?: string
}

type SupabaseError = {
  message: string
  details?: string
  hint?: string
  code?: string
}

type AuthUser = {
  id: string
  email: string
  email_confirmed_at?: string
  created_at: string
  updated_at?: string
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
}

type AuthSession = {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at?: number
  token_type: string
  user: AuthUser
}

// Query builder type for proper typing
type MockQueryBuilder<T> = {
  select: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  insert: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  update: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  upsert: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  delete: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  eq: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  neq: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  gt: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  gte: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  lt: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  lte: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  like: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  ilike: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  is: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  in: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  contains: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  containedBy: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  range: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  textSearch: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  filter: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  not: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  or: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  and: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  order: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  limit: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  offset: (..._args: unknown[]) => MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>>
  single: () => Promise<SupabaseResponse<T>>
  maybeSingle: () => Promise<SupabaseResponse<T>>
  csv: () => Promise<{ data: string; error: null }>
  then: <TResult1 = SupabaseResponse<T>>(
    onfulfilled?: ((value: SupabaseResponse<T>) => TResult1 | PromiseLike<TResult1>) | null
  ) => Promise<TResult1>
  _setResponse: (newResponse: SupabaseResponse<T>) => void
  _getResponse: () => SupabaseResponse<T>
}

// Factory to create mock query builder
function createMockQueryBuilder<T = unknown>(
  defaultResponse: SupabaseResponse<T>
): MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>> {
  let response = defaultResponse

  const queryBuilder: MockQueryBuilder<T> & PromiseLike<SupabaseResponse<T>> = {
    select: mock((..._args: unknown[]) => queryBuilder),
    insert: mock((..._args: unknown[]) => queryBuilder),
    update: mock((..._args: unknown[]) => queryBuilder),
    upsert: mock((..._args: unknown[]) => queryBuilder),
    delete: mock((..._args: unknown[]) => queryBuilder),
    eq: mock((..._args: unknown[]) => queryBuilder),
    neq: mock((..._args: unknown[]) => queryBuilder),
    gt: mock((..._args: unknown[]) => queryBuilder),
    gte: mock((..._args: unknown[]) => queryBuilder),
    lt: mock((..._args: unknown[]) => queryBuilder),
    lte: mock((..._args: unknown[]) => queryBuilder),
    like: mock((..._args: unknown[]) => queryBuilder),
    ilike: mock((..._args: unknown[]) => queryBuilder),
    is: mock((..._args: unknown[]) => queryBuilder),
    in: mock((..._args: unknown[]) => queryBuilder),
    contains: mock((..._args: unknown[]) => queryBuilder),
    containedBy: mock((..._args: unknown[]) => queryBuilder),
    range: mock((..._args: unknown[]) => queryBuilder),
    textSearch: mock((..._args: unknown[]) => queryBuilder),
    filter: mock((..._args: unknown[]) => queryBuilder),
    not: mock((..._args: unknown[]) => queryBuilder),
    or: mock((..._args: unknown[]) => queryBuilder),
    and: mock((..._args: unknown[]) => queryBuilder),
    order: mock((..._args: unknown[]) => queryBuilder),
    limit: mock((..._args: unknown[]) => queryBuilder),
    offset: mock((..._args: unknown[]) => queryBuilder),
    single: mock(() => Promise.resolve(response)),
    maybeSingle: mock(() => Promise.resolve(response)),
    csv: mock(() => Promise.resolve({ data: '', error: null })),
    // eslint-disable-next-line unicorn/no-thenable -- Required for PromiseLike interface
    then: <TResult1 = SupabaseResponse<T>>(
      onfulfilled?: ((value: SupabaseResponse<T>) => TResult1 | PromiseLike<TResult1>) | null
    ) => Promise.resolve(response).then(onfulfilled),
    // Allow setting custom response for specific tests
    _setResponse: (newResponse: SupabaseResponse<T>) => {
      response = newResponse
    },
    _getResponse: () => response,
  }

  return queryBuilder
}

// Factory to create mock auth client
function createMockAuthClient() {
  let currentSession: AuthSession | null = null
  let currentUser: AuthUser | null = null

  return {
    getSession: mock(() =>
      Promise.resolve({
        data: { session: currentSession },
        error: null,
      })
    ),
    getUser: mock(() =>
      Promise.resolve({
        data: { user: currentUser },
        error: null,
      })
    ),
    signInWithPassword: mock((_credentials: { email: string; password: string }) =>
      Promise.resolve({
        data: { session: currentSession, user: currentUser },
        error: null,
      })
    ),
    signInWithOAuth: mock(() =>
      Promise.resolve({
        data: { provider: 'google', url: 'https://auth.example.com' },
        error: null,
      })
    ),
    signUp: mock((_credentials: { email: string; password: string }) =>
      Promise.resolve({
        data: { session: currentSession, user: currentUser },
        error: null,
      })
    ),
    signOut: mock(() => {
      currentSession = null
      currentUser = null
      return Promise.resolve({ error: null })
    }),
    onAuthStateChange: mock((_callback: (event: string, session: AuthSession | null) => void) => ({
      data: {
        subscription: {
          unsubscribe: mock(() => {}),
        },
      },
    })),
    refreshSession: mock(() =>
      Promise.resolve({
        data: { session: currentSession, user: currentUser },
        error: null,
      })
    ),
    resetPasswordForEmail: mock(() => Promise.resolve({ data: {}, error: null })),
    updateUser: mock(() =>
      Promise.resolve({
        data: { user: currentUser },
        error: null,
      })
    ),
    // Test helpers
    _setSession: (session: AuthSession | null) => {
      currentSession = session
      if (session) {
        currentUser = session.user
      }
    },
    _setUser: (user: AuthUser | null) => {
      currentUser = user
    },
    _getSession: () => currentSession,
    _getUser: () => currentUser,
  }
}

// Factory to create mock storage client
function createMockStorageClient() {
  return {
    from: mock((bucket: string) => ({
      bucket,
      upload: mock((_path: string, _file: Blob | File) =>
        Promise.resolve({
          data: { path: 'test/file.jpg' },
          error: null,
        })
      ),
      download: mock((_path: string) =>
        Promise.resolve({
          data: new Blob(['test']),
          error: null,
        })
      ),
      remove: mock((_paths: string[]) =>
        Promise.resolve({
          data: [{ name: 'file.jpg' }],
          error: null,
        })
      ),
      list: mock((_path?: string) =>
        Promise.resolve({
          data: [{ name: 'file.jpg', id: '1', created_at: new Date().toISOString() }],
          error: null,
        })
      ),
      getPublicUrl: mock((path: string) => ({
        data: { publicUrl: `https://storage.example.com/${bucket}/${path}` },
      })),
      createSignedUrl: mock((path: string, _expiresIn?: number) =>
        Promise.resolve({
          data: { signedUrl: `https://storage.example.com/${bucket}/${path}?token=xxx` },
          error: null,
        })
      ),
    })),
  }
}

const DEFAULT_RESPONSE: SupabaseResponse<unknown> = { data: null, error: null }

// Main factory to create complete mock Supabase client
export function createMockSupabaseClient<T = unknown>(
  defaultResponse: SupabaseResponse<T> = DEFAULT_RESPONSE as SupabaseResponse<T>
) {
  const queryBuilder = createMockQueryBuilder(defaultResponse)
  const authClient = createMockAuthClient()
  const storageClient = createMockStorageClient()

  return {
    from: mock((_table: string) => queryBuilder),
    rpc: mock((_fn: string, _params?: Record<string, unknown>) =>
      Promise.resolve({ data: null, error: null })
    ),
    auth: authClient,
    storage: storageClient,
    // Access to internals for test setup
    _queryBuilder: queryBuilder,
    _auth: authClient,
    _storage: storageClient,
  }
}

// Helper to set mock response for a query
export function mockSupabaseResponse<T>(
  client: ReturnType<typeof createMockSupabaseClient>,
  response: SupabaseResponse<T>
) {
  client._queryBuilder._setResponse(response as SupabaseResponse<unknown>)
}

// Helper to create mock error response
export function createMockError(message: string, code?: string, details?: string): SupabaseError {
  return {
    message,
    code,
    details,
  }
}

// Helper to create mock user
export function createMockUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
    ...overrides,
  }
}

// Helper to create mock session
export function createMockSession(userOverrides: Partial<AuthUser> = {}): AuthSession {
  const user = createMockUser(userOverrides)
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user,
  }
}

// Helper to setup authenticated state
export function setupMockAuth(
  client: ReturnType<typeof createMockSupabaseClient>,
  userOverrides: Partial<AuthUser> = {}
) {
  const session = createMockSession(userOverrides)
  client._auth._setSession(session)
  return { session, user: session.user }
}

// Helper to clear authenticated state
export function clearMockAuth(client: ReturnType<typeof createMockSupabaseClient>) {
  client._auth._setSession(null)
}
