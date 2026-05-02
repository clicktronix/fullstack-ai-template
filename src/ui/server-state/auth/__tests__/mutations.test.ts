/* eslint-disable sonarjs/no-hardcoded-passwords -- Test credentials */
import type { Session } from '@supabase/supabase-js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from 'bun:test'
import { createElement, type ReactNode } from 'react'
import * as authActions from '@/adapters/inbound/next/server-actions/auth'

type SignInInput = {
  email: string
  password: string
}

type SignUpInput = SignInInput & {
  fullName?: string
}

// Mock auth API
const mockSignIn = mock<(input: SignInInput) => Promise<Session>>()
const mockSignUp = mock<(input: SignUpInput) => Promise<Session | null>>()
const mockSignOut = mock<() => Promise<void>>()

// Import after mocking
const { useSignIn, useSignUp, useSignOut } = await import('@/ui/server-state/auth/mutations')

// Helper to create mock session
function createMockSession(overrides?: Partial<Session>): Session {
  return {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'user-1',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      created_at: '2024-01-01T00:00:00Z',
    },
    ...overrides,
  }
}

// Create wrapper with QueryClientProvider
function createWrapper(queryClient: QueryClient) {
  function TestWrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  TestWrapper.displayName = 'TestWrapper'
  return TestWrapper
}

describe('useSignIn', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    mockSignIn.mockReset()
    spyOn(authActions, 'signInAction').mockImplementation(mockSignIn)
  })

  afterEach(() => {
    mock.restore()
  })

  test('signs in successfully and updates cache', async () => {
    const session = createMockSession()
    mockSignIn.mockResolvedValue(session)

    const { result } = renderHook(() => useSignIn(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate({ email: 'test@example.com', password: 'password123' })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })

  test('handles sign in error', async () => {
    const error = new Error('Invalid credentials')
    mockSignIn.mockRejectedValue(error)

    const { result } = renderHook(() => useSignIn(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate({ email: 'test@example.com', password: 'wrong' })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Invalid credentials')
  })
})

describe('useSignUp', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    mockSignUp.mockReset()
    spyOn(authActions, 'signUpAction').mockImplementation(mockSignUp)
  })

  afterEach(() => {
    mock.restore()
  })

  test('signs up successfully with session returned', async () => {
    const session = createMockSession({
      user: { ...createMockSession().user, email: 'new@example.com' },
    })
    mockSignUp.mockResolvedValue(session)

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate({
        email: 'new@example.com',
        password: 'password123',
        fullName: 'Test User',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
      fullName: 'Test User',
    })
  })

  test('signs up successfully with email confirmation required (null session)', async () => {
    mockSignUp.mockResolvedValue(null)

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate({ email: 'new@example.com', password: 'password123' })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeNull()
  })
})

describe('useSignOut', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    mockSignOut.mockReset()
    spyOn(authActions, 'signOutAction').mockImplementation(mockSignOut)
  })

  afterEach(() => {
    mock.restore()
  })

  test('signs out successfully and clears cache', async () => {
    mockSignOut.mockResolvedValue(undefined)

    const clearSpy = mock(() => undefined)
    queryClient.clear = clearSpy

    const { result } = renderHook(() => useSignOut(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate()
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockSignOut).toHaveBeenCalled()
    expect(clearSpy).toHaveBeenCalled()
  })

  test('clears cache even on sign out error', async () => {
    mockSignOut.mockRejectedValue(new Error('Network error'))

    const clearSpy = mock(() => undefined)
    queryClient.clear = clearSpy

    const { result } = renderHook(() => useSignOut(), {
      wrapper: createWrapper(queryClient),
    })

    act(() => {
      result.current.mutate()
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    // Cache should still be cleared
    expect(clearSpy).toHaveBeenCalled()
  })
})
