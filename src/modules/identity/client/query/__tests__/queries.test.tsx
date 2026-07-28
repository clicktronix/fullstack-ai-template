import type { Session } from '@supabase/supabase-js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, mock, test } from 'bun:test'
import type { ReactNode } from 'react'

const mockGetSession = mock()
const mockOnAuthStateChange = mock()
const mockUnsubscribe = mock()
const mockFetch = mock()

mock.module('@/shared/client/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}))

const { useCurrentUser, useSession } = await import('../queries')

const session = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
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
} satisfies Session

const user = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  role: 'admin' as const,
  full_name: 'Test User',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return {
    queryClient,
    Wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    },
  }
}

beforeEach(() => {
  mockGetSession.mockReset()
  mockOnAuthStateChange.mockReset()
  mockUnsubscribe.mockReset()
  mockFetch.mockReset()
  globalThis.fetch = mockFetch as unknown as typeof fetch
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: mockUnsubscribe } },
  })
})

describe('identity client queries', () => {
  test('reads the browser session without a Server Action', async () => {
    mockGetSession.mockResolvedValue({ data: { session }, error: null })
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useSession(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(session)
    expect(mockGetSession).toHaveBeenCalledTimes(1)
    expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1)
  })

  test('clears cached identity after a signed-out event', async () => {
    let callback: ((event: string, value: Session | null) => void) | undefined
    mockGetSession.mockResolvedValue({ data: { session }, error: null })
    mockOnAuthStateChange.mockImplementation((nextCallback) => {
      callback = nextCallback
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } }
    })
    const { queryClient, Wrapper } = createWrapper()

    renderHook(() => useSession(), { wrapper: Wrapper })
    await waitFor(() =>
      expect(queryClient.getQueryData<Session | null>(['auth', 'session'])).toEqual(session)
    )

    act(() => callback?.('SIGNED_OUT', null))

    expect(queryClient.getQueryData(['auth', 'session'])).toBeNull()
  })

  test('reads the application user through the GET contract', async () => {
    mockFetch.mockResolvedValue(
      Response.json({ data: user, requestId: 'request-1' }, { status: 200 })
    )
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useCurrentUser(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(user)
    expect(mockFetch).toHaveBeenCalledWith('/api/identity/me', {
      method: 'GET',
      cache: 'no-store',
    })
  })

  test('exposes a failed GET as query error state', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 503, statusText: 'Unavailable' }))
    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useCurrentUser({ retry: false }), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
