import type { Session } from '@supabase/supabase-js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { afterAll, beforeEach, describe, expect, spyOn, test } from 'bun:test'
import { type ReactNode } from 'react'
import type { User } from '@/domain/user/user'
import * as authQueries from '@/ui/server-state/auth/queries'
import { AuthProvider, useAuth } from '../AuthContext'

// usePathname is already globally mocked in setup.ts and returns '/'.
// Tests that need another pathname use mock.module.

// Mock hooks through spyOn.
const mockUseSession = spyOn(authQueries, 'useSession')
const mockUseCurrentUser = spyOn(authQueries, 'useCurrentUser')

// Test fixtures.
const mockSession: Session = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: {
    id: 'user-123',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: '2025-01-01T00:00:00Z',
  },
}

const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  role: 'admin',
  full_name: 'Test User',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
}

// React Query mock types that match UseQueryResult.
type MockQueryResult<T> = {
  data: T | undefined
  isLoading: boolean
  error: Error | null
  isSuccess: boolean
  isError: boolean
}

function createMockQueryResult<T>(overrides: Partial<MockQueryResult<T>> = {}): MockQueryResult<T> {
  return {
    data: undefined,
    isLoading: false,
    error: null,
    isSuccess: false,
    isError: false,
    ...overrides,
  }
}

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
}

function createWrapper(queryClient: QueryClient, initialUser?: User | null) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider user={initialUser}>{children}</AuthProvider>
      </QueryClientProvider>
    )
  }
}

beforeEach(() => {
  mockUseSession.mockClear()
  mockUseCurrentUser.mockClear()
})

afterAll(() => {
  mockUseSession.mockRestore()
  mockUseCurrentUser.mockRestore()
})

describe('AuthProvider', () => {
  describe('loading state', () => {
    test('isLoading=true when session is loading', () => {
      mockUseSession.mockReturnValue(
        createMockQueryResult({ isLoading: true }) as ReturnType<typeof authQueries.useSession>
      )
      mockUseCurrentUser.mockReturnValue(
        createMockQueryResult({ isLoading: false }) as ReturnType<typeof authQueries.useCurrentUser>
      )

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      })

      expect(result.current.isLoading).toBe(true)
    })

    test('isLoading=true when user is loading', () => {
      mockUseSession.mockReturnValue(
        createMockQueryResult({ isLoading: false }) as ReturnType<typeof authQueries.useSession>
      )
      mockUseCurrentUser.mockReturnValue(
        createMockQueryResult({ isLoading: true }) as ReturnType<typeof authQueries.useCurrentUser>
      )

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      })

      expect(result.current.isLoading).toBe(true)
    })

    test('isLoading=false when both queries are complete', () => {
      mockUseSession.mockReturnValue(
        createMockQueryResult({
          data: mockSession,
          isLoading: false,
          isSuccess: true,
        }) as ReturnType<typeof authQueries.useSession>
      )
      mockUseCurrentUser.mockReturnValue(
        createMockQueryResult({
          data: mockUser,
          isLoading: false,
          isSuccess: true,
        }) as ReturnType<typeof authQueries.useCurrentUser>
      )

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('authentication', () => {
    test('isAuthenticated=true when user exists', () => {
      mockUseSession.mockReturnValue(
        createMockQueryResult({
          data: mockSession,
          isSuccess: true,
        }) as ReturnType<typeof authQueries.useSession>
      )
      mockUseCurrentUser.mockReturnValue(
        createMockQueryResult({
          data: mockUser,
          isSuccess: true,
        }) as ReturnType<typeof authQueries.useCurrentUser>
      )

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user).toEqual(mockUser)
    })

    test('isAuthenticated=false without user', () => {
      mockUseSession.mockReturnValue(
        createMockQueryResult({
          data: undefined,
          isSuccess: true,
        }) as ReturnType<typeof authQueries.useSession>
      )
      mockUseCurrentUser.mockReturnValue(
        createMockQueryResult({
          data: undefined,
          isSuccess: true,
        }) as ReturnType<typeof authQueries.useCurrentUser>
      )

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })
  })

  describe('session', () => {
    test('provides session from useSession', () => {
      mockUseSession.mockReturnValue(
        createMockQueryResult({
          data: mockSession,
          isSuccess: true,
        }) as ReturnType<typeof authQueries.useSession>
      )
      mockUseCurrentUser.mockReturnValue(
        createMockQueryResult({
          data: mockUser,
          isSuccess: true,
        }) as ReturnType<typeof authQueries.useCurrentUser>
      )

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      })

      expect(result.current.session).toEqual(mockSession)
    })

    test('session=null when there is no session', () => {
      mockUseSession.mockReturnValue(
        createMockQueryResult({
          data: undefined,
          isSuccess: true,
        }) as ReturnType<typeof authQueries.useSession>
      )
      mockUseCurrentUser.mockReturnValue(
        createMockQueryResult({
          data: undefined,
          isSuccess: true,
        }) as ReturnType<typeof authQueries.useCurrentUser>
      )

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      })

      expect(result.current.session).toBeNull()
    })
  })

  describe('error handling', () => {
    test('prioritizes session error over user error', () => {
      const sessionError = new Error('Session expired')
      const userError = new Error('User fetch failed')

      mockUseSession.mockReturnValue(
        createMockQueryResult({
          error: sessionError,
          isError: true,
        }) as ReturnType<typeof authQueries.useSession>
      )
      mockUseCurrentUser.mockReturnValue(
        createMockQueryResult({
          error: userError,
          isError: true,
        }) as ReturnType<typeof authQueries.useCurrentUser>
      )

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      })

      expect(result.current.error).toBe(sessionError)
    })

    test('shows user error when session error is absent', () => {
      const userError = new Error('User fetch failed')

      mockUseSession.mockReturnValue(
        createMockQueryResult({
          error: null,
          isSuccess: true,
        }) as ReturnType<typeof authQueries.useSession>
      )
      mockUseCurrentUser.mockReturnValue(
        createMockQueryResult({
          error: userError,
          isError: true,
        }) as ReturnType<typeof authQueries.useCurrentUser>
      )

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      })

      expect(result.current.error).toBe(userError)
    })

    test('error=null when there are no errors', () => {
      mockUseSession.mockReturnValue(
        createMockQueryResult({
          data: mockSession,
          isSuccess: true,
        }) as ReturnType<typeof authQueries.useSession>
      )
      mockUseCurrentUser.mockReturnValue(
        createMockQueryResult({
          data: mockUser,
          isSuccess: true,
        }) as ReturnType<typeof authQueries.useCurrentUser>
      )

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('initial user (SSR)', () => {
    test('uses initialUser when React Query has not returned data yet', () => {
      mockUseSession.mockReturnValue(
        createMockQueryResult({
          isLoading: true,
        }) as ReturnType<typeof authQueries.useSession>
      )
      mockUseCurrentUser.mockReturnValue(
        createMockQueryResult({
          data: undefined,
          isLoading: true,
        }) as ReturnType<typeof authQueries.useCurrentUser>
      )

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient, mockUser),
      })

      // initialUser is used as fallback.
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    test('prefers React Query data over initialUser', () => {
      const updatedUser: User = {
        ...mockUser,
        full_name: 'Updated Name',
      }

      mockUseSession.mockReturnValue(
        createMockQueryResult({
          data: mockSession,
          isSuccess: true,
        }) as ReturnType<typeof authQueries.useSession>
      )
      mockUseCurrentUser.mockReturnValue(
        createMockQueryResult({
          data: updatedUser,
          isSuccess: true,
        }) as ReturnType<typeof authQueries.useCurrentUser>
      )

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient, mockUser),
      })

      expect(result.current.user?.full_name).toBe('Updated Name')
    })

    test('isAuthenticated=true with initialUser even while loading', () => {
      mockUseSession.mockReturnValue(
        createMockQueryResult({ isLoading: true }) as ReturnType<typeof authQueries.useSession>
      )
      mockUseCurrentUser.mockReturnValue(
        createMockQueryResult({
          data: undefined,
          isLoading: true,
        }) as ReturnType<typeof authQueries.useCurrentUser>
      )

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient, mockUser),
      })

      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('disabling queries on auth pages', () => {
    test('passes enabled to hooks based on pathname', () => {
      // usePathname is globally mocked and returns '/' (not an auth route).
      mockUseSession.mockReturnValue(
        createMockQueryResult({
          data: mockSession,
          isSuccess: true,
        }) as ReturnType<typeof authQueries.useSession>
      )
      mockUseCurrentUser.mockReturnValue(
        createMockQueryResult({
          data: mockUser,
          isSuccess: true,
        }) as ReturnType<typeof authQueries.useCurrentUser>
      )

      const queryClient = createTestQueryClient()
      renderHook(() => useAuth(), {
        wrapper: createWrapper(queryClient),
      })

      // useSession is called with enabled: true (pathname '/' is not an auth route).
      expect(mockUseSession).toHaveBeenCalled()
      const sessionOptions = mockUseSession.mock.calls[0][0]
      expect(sessionOptions?.enabled).toBe(true)

      // useCurrentUser is also called with enabled: true.
      expect(mockUseCurrentUser).toHaveBeenCalled()
      const userOptions = mockUseCurrentUser.mock.calls[0][0]
      expect(userOptions?.enabled).toBe(true)
    })
  })
})

describe('useAuth', () => {
  test('throws when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within AuthProvider')
  })
})
