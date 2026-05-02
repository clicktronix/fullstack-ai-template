import type { Session } from '@supabase/supabase-js'
import { beforeEach, describe, expect, mock, test } from 'bun:test'

const mockGetUser = mock()
const mockGetSession = mock()

mock.module('@/adapters/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: mockGetUser,
      getSession: mockGetSession,
    },
  }),
}))

const { getSessionAction } = await import('@/adapters/inbound/next/server-actions/auth')

const mockSession = {
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'user-123',
    email: 'user@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: '2026-01-01T00:00:00.000Z',
  },
} satisfies Session

describe('auth server actions', () => {
  beforeEach(() => {
    mockGetUser.mockReset()
    mockGetSession.mockReset()
  })

  test('verifies the user before returning a session', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-123' } },
      error: null,
    })
    mockGetSession.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    })

    const result = await getSessionAction()

    expect(result).toEqual(mockSession)
    expect(mockGetUser).toHaveBeenCalledTimes(1)
    expect(mockGetSession).toHaveBeenCalledTimes(1)
  })

  test('does not return an unverified cookie session', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('invalid token'),
    })

    const result = await getSessionAction()

    expect(result).toBeNull()
    expect(mockGetUser).toHaveBeenCalledTimes(1)
    expect(mockGetSession).not.toHaveBeenCalled()
  })
})
