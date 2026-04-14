import type { Session } from '@supabase/supabase-js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, spyOn, test } from 'bun:test'
import { type ReactNode } from 'react'
import type { User } from '@/domain/user/user'
import * as authQueries from '@/ui/server-state/auth/queries'
import { AuthProvider, useAuth } from '../AuthContext'

// Мок usePathname — уже замокан глобально в setup.ts (возвращает '/')
// Для тестов, требующих другой pathname, используем mock.module

// Мокаем хуки через spyOn
const mockUseSession = spyOn(authQueries, 'useSession')
const mockUseCurrentUser = spyOn(authQueries, 'useCurrentUser')

// Тестовые фикстуры
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

// Типы для моков React Query — соответствуют UseQueryResult
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

describe('AuthProvider', () => {
  describe('состояние загрузки', () => {
    test('isLoading=true когда сессия загружается', () => {
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

    test('isLoading=true когда пользователь загружается', () => {
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

    test('isLoading=false когда оба запроса завершены', () => {
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

  describe('аутентификация', () => {
    test('isAuthenticated=true при наличии пользователя', () => {
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

    test('isAuthenticated=false без пользователя', () => {
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

  describe('сессия', () => {
    test('предоставляет сессию из useSession', () => {
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

    test('session=null если нет сессии', () => {
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

  describe('обработка ошибок', () => {
    test('приоритет ошибки сессии над ошибкой пользователя', () => {
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

    test('показывает ошибку пользователя если нет ошибки сессии', () => {
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

    test('error=null когда нет ошибок', () => {
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

  describe('начальный пользователь (SSR)', () => {
    test('использует initialUser если React Query ещё не вернул данных', () => {
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

      // initialUser используется как фоллбэк
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    test('предпочитает данные React Query над initialUser', () => {
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

    test('isAuthenticated=true с initialUser даже при загрузке', () => {
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

  describe('отключение запросов на auth-страницах', () => {
    test('передаёт enabled в хуки на основе pathname', () => {
      // usePathname замокан глобально и возвращает '/' (не auth-роут)
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

      // useSession вызывается с enabled: true (pathname '/' — не auth-роут)
      expect(mockUseSession).toHaveBeenCalled()
      const sessionOptions = mockUseSession.mock.calls[0][0]
      expect(sessionOptions?.enabled).toBe(true)

      // useCurrentUser тоже вызывается с enabled: true
      expect(mockUseCurrentUser).toHaveBeenCalled()
      const userOptions = mockUseCurrentUser.mock.calls[0][0]
      expect(userOptions?.enabled).toBe(true)
    })
  })
})

describe('useAuth', () => {
  test('выбрасывает ошибку при использовании вне AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within AuthProvider')
  })
})
