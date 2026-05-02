import type { Session } from '@supabase/supabase-js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, mock, spyOn, test } from 'bun:test'
import { type ReactNode } from 'react'
import * as authActions from '@/adapters/inbound/next/server-actions/auth'
import * as authEvents from '@/adapters/outbound/supabase/auth-events'
import type { User } from '@/domain/user/user'
import { useSession, useCurrentUser } from '@/ui/server-state/auth/queries'

// Mock API calls
const mockGetSession = spyOn(authActions, 'getSessionAction')
const mockGetCurrentUser = spyOn(authActions, 'getCurrentUserAction')
const mockOnAuthStateChange = spyOn(authEvents, 'onAuthStateChange')

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

const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  role: 'admin',
  full_name: 'Test User',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
}

// Create a fresh QueryClient for each test
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

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

// Mock subscription object - Supabase Subscription type requires id and callback
const mockUnsubscribe = mock(() => {})
const mockSubscription = {
  id: 'test-subscription-id',
  callback: () => {},
  unsubscribe: mockUnsubscribe,
}

beforeEach(() => {
  mockGetSession.mockClear()
  mockGetCurrentUser.mockClear()
  mockOnAuthStateChange.mockClear()
  mockUnsubscribe.mockClear()
  mockOnAuthStateChange.mockReturnValue(mockSubscription)
})

describe('useSession', () => {
  test('fetches current session', async () => {
    mockGetSession.mockResolvedValueOnce(mockSession)
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockSession)
    expect(mockGetSession).toHaveBeenCalledTimes(1)
  })

  test('returns null when not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null)
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeNull()
  })

  test('subscribes to auth state changes', () => {
    mockGetSession.mockResolvedValueOnce(mockSession)
    const queryClient = createTestQueryClient()

    renderHook(() => useSession(), {
      wrapper: createWrapper(queryClient),
    })

    expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1)
    expect(mockOnAuthStateChange).toHaveBeenCalledWith(expect.any(Function))
  })

  test('unsubscribes on unmount', () => {
    mockGetSession.mockResolvedValueOnce(mockSession)
    const queryClient = createTestQueryClient()

    const { unmount } = renderHook(() => useSession(), {
      wrapper: createWrapper(queryClient),
    })

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })

  test('updates cache when auth state changes', async () => {
    mockGetSession.mockResolvedValueOnce(mockSession)
    const queryClient = createTestQueryClient()
    let authCallback: authEvents.AuthStateChangeCallback | null = null

    mockOnAuthStateChange.mockImplementation((callback) => {
      authCallback = callback
      return {
        id: 'test-subscription-id',
        callback: () => {},
        unsubscribe: mockUnsubscribe,
      }
    })

    renderHook(() => useSession(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(queryClient.getQueryData<Session | null>(['auth', 'session'])).toEqual(mockSession)
    })

    // Simulate sign out
    act(() => {
      authCallback?.('SIGNED_OUT', null)
    })

    expect(queryClient.getQueryData(['auth', 'session'])).toBeNull()
  })

  test('uses correct query key', async () => {
    mockGetSession.mockResolvedValueOnce(mockSession)
    const queryClient = createTestQueryClient()

    renderHook(() => useSession(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      const data = queryClient.getQueryData(['auth', 'session'])
      expect(data).toEqual(mockSession)
    })
  })

  test('handles error state', async () => {
    const error = new Error('Failed to get session')
    mockGetSession.mockRejectedValueOnce(error)
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })
})

describe('useCurrentUser', () => {
  test('fetches current user data', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(mockUser)
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockUser)
    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1)
  })

  test('returns null when not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(null)
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeNull()
  })

  test('handles loading state', () => {
    mockGetCurrentUser.mockImplementation(() => new Promise(() => {})) // Never resolves
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(queryClient),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  test('handles error state', async () => {
    // Reset the mock implementation from previous test
    mockGetCurrentUser.mockReset()
    const error = new Error('Failed to get user')
    mockGetCurrentUser.mockRejectedValue(error)
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useCurrentUser({ retry: false }), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true)
      },
      { timeout: 3000 }
    )

    expect(result.current.error).toBeDefined()
  })

  test('uses correct query key', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(mockUser)
    const queryClient = createTestQueryClient()

    renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      const data = queryClient.getQueryData(['auth', 'user'])
      expect(data).toEqual(mockUser)
    })
  })

  test('accepts custom options', async () => {
    mockGetCurrentUser.mockResolvedValueOnce(mockUser)
    const queryClient = createTestQueryClient()

    renderHook(() => useCurrentUser({ enabled: true }), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      const data = queryClient.getQueryData<User>(['auth', 'user'])
      expect(data).toEqual(mockUser)
    })
  })

  test('does not retry on session errors', async () => {
    const sessionError = new Error('session expired')
    mockGetCurrentUser.mockRejectedValue(sessionError)
    const queryClient = createTestQueryClient()

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: createWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    // Should only be called once (no retries)
    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1)
  })
})
