import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { createIdentityRouteHandler, type IdentityRouteDependencies } from './route'

const mockReadCurrentUser = mock<IdentityRouteDependencies['readCurrentUser']>()
const GET = createIdentityRouteHandler({ readCurrentUser: mockReadCurrentUser })

describe('/api/identity/me', () => {
  beforeEach(() => mockReadCurrentUser.mockReset())

  test('returns the current user in the API envelope', async () => {
    const user = {
      id: 'user-1',
      email: 'admin@example.com',
      role: 'admin' as const,
      full_name: 'Admin User',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }
    mockReadCurrentUser.mockResolvedValueOnce(user)

    const response = await GET(
      new Request('https://template.test/api/identity/me', {
        headers: { 'x-request-id': 'request-123' },
      })
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: user, requestId: 'request-123' })
  })

  test('returns null for an anonymous session', async () => {
    mockReadCurrentUser.mockResolvedValueOnce(null)

    const response = await GET(
      new Request('https://template.test/api/identity/me', {
        headers: { 'x-request-id': 'request-123' },
      })
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: null, requestId: 'request-123' })
  })
})
