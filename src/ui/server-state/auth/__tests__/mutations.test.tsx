/* eslint-disable sonarjs/no-hardcoded-passwords -- Test credentials are intentionally hardcoded */
import type { Session } from '@supabase/supabase-js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, spyOn, test } from 'bun:test'
import { type ReactNode } from 'react'
import * as authApi from '@/adapters/outbound/api/auth'
import { useSignIn, useSignUp, useSignOut } from '@/ui/server-state/auth/mutations'

// Mock API calls
const mockSignIn = spyOn(authApi, 'signIn')
const mockSignUp = spyOn(authApi, 'signUp')
const mockSignOut = spyOn(authApi, 'signOut')

// Test fixtures
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

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

beforeEach(() => {
  mockSignIn.mockClear()
  mockSignUp.mockClear()
  mockSignOut.mockClear()
})

describe('useSignIn', () => {
  test('calls signIn with email and password', async () => {
    mockSignIn.mockResolvedValueOnce(mockSession)
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useSignIn(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate({
        email: 'test@example.com',
        password: 'testCredential',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'testCredential')
    expect(mockSignIn).toHaveBeenCalledTimes(1)
  })

  test('updates session cache on success', async () => {
    mockSignIn.mockResolvedValueOnce(mockSession)
    const queryClient = createTestQueryClient()
    const setQueryDataSpy = spyOn(queryClient, 'setQueryData')

    const { result } = renderHook(() => useSignIn(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate({
        email: 'test@example.com',
        password: 'testCredential',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(setQueryDataSpy).toHaveBeenCalledWith(['auth', 'session'], mockSession)
  })

  test('invalidates user query on success', async () => {
    mockSignIn.mockResolvedValueOnce(mockSession)
    const queryClient = createTestQueryClient()
    const invalidateSpy = spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useSignIn(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate({
        email: 'test@example.com',
        password: 'testCredential',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['auth', 'user'] })
  })

  test('returns success state after mutation', async () => {
    mockSignIn.mockResolvedValueOnce(mockSession)
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useSignIn(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate({
        email: 'test@example.com',
        password: 'testCredential',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockSession)
  })

  test('returns error state on failure', async () => {
    const error = new Error('Invalid credentials')
    mockSignIn.mockRejectedValueOnce(error)
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useSignIn(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate({
        email: 'test@example.com',
        password: 'wrongCredential',
      })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })

  test('provides loading state during mutation', async () => {
    let resolvePromise: (value: Session) => void
    mockSignIn.mockImplementation(
      () =>
        new Promise<Session>((resolve) => {
          resolvePromise = resolve
        })
    )
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useSignIn(), {
      wrapper: createWrapper(queryClient),
    })

    // Start mutation but don't await
    act(() => {
      result.current.mutate({
        email: 'test@example.com',
        password: 'testCredential',
      })
    })

    // Check pending state
    await waitFor(() => {
      expect(result.current.isPending).toBe(true)
    })

    // Resolve the promise
    await act(async () => {
      resolvePromise!(mockSession)
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
  })
})

describe('useSignUp', () => {
  test('calls signUp with email, password, and fullName', async () => {
    mockSignUp.mockResolvedValueOnce(mockSession)
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate({
        email: 'new@example.com',
        password: 'testCredential',
        fullName: 'New User',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockSignUp).toHaveBeenCalledWith('new@example.com', 'testCredential', 'New User')
  })

  test('calls signUp without fullName when not provided', async () => {
    mockSignUp.mockResolvedValueOnce(mockSession)
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate({
        email: 'new@example.com',
        password: 'testCredential',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockSignUp).toHaveBeenCalledWith('new@example.com', 'testCredential', undefined)
  })

  test('updates cache when session is returned', async () => {
    mockSignUp.mockResolvedValueOnce(mockSession)
    const queryClient = createTestQueryClient()
    const setQueryDataSpy = spyOn(queryClient, 'setQueryData')

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate({
        email: 'new@example.com',
        password: 'testCredential',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(setQueryDataSpy).toHaveBeenCalledWith(['auth', 'session'], mockSession)
  })

  test('does not update cache when email confirmation required (null session)', async () => {
    mockSignUp.mockResolvedValueOnce(null)
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate({
        email: 'new@example.com',
        password: 'testCredential',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Cache should not be updated when session is null
    expect(queryClient.getQueryData(['auth', 'session'])).toBeUndefined()
    expect(result.current.data).toBeNull()
  })

  test('returns error state on failure', async () => {
    const error = new Error('Email already exists')
    mockSignUp.mockRejectedValueOnce(error)
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate({
        email: 'existing@example.com',
        password: 'testCredential',
      })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})

describe('useSignOut', () => {
  test('calls signOut API', async () => {
    mockSignOut.mockResolvedValueOnce(undefined)
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useSignOut(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })

  test('clears all cached data on success', async () => {
    mockSignOut.mockResolvedValueOnce(undefined)
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['auth', 'session'], mockSession)
    queryClient.setQueryData(['auth', 'user'], { id: 'user-123' })

    const clearSpy = spyOn(queryClient, 'clear')

    const { result } = renderHook(() => useSignOut(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(clearSpy).toHaveBeenCalledTimes(1)
  })

  test('clears cache even on error', async () => {
    const error = new Error('Network error')
    mockSignOut.mockRejectedValueOnce(error)
    const queryClient = createTestQueryClient()
    const clearSpy = spyOn(queryClient, 'clear')

    const { result } = renderHook(() => useSignOut(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate()
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    // Should still clear cache even on error
    expect(clearSpy).toHaveBeenCalledTimes(1)
  })
})
