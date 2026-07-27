import { beforeEach, describe, expect, mock, test } from 'bun:test'

const mockCreateApiHandlerContext = mock()
const mockListLabels = mock()

mock.module('@/infrastructure/api/context', () => ({
  createApiHandlerContext: mockCreateApiHandlerContext,
  getRequestId: () => 'request-labels',
}))

mock.module('@/use-cases/labels/labels', () => ({
  listLabels: mockListLabels,
}))

mock.module('@/adapters/outbound/supabase/labels.repository', () => ({
  createSupabaseLabelsRepository: () => ({ list: mock() }),
}))

const { GET } = await import('../route')

describe('/api/labels route handler', () => {
  beforeEach(() => {
    mockCreateApiHandlerContext.mockReset()
    mockListLabels.mockReset()
    mockCreateApiHandlerContext.mockResolvedValue({
      requestId: 'request-labels',
      role: 'admin',
      supabase: {},
    })
  })

  test('returns labels through an authenticated HTTP surface', async () => {
    mockListLabels.mockResolvedValue([{ id: 'urgent', name: 'Urgent', color: 'red' }])

    const response = await GET(new Request('https://template.test/api/labels'))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('x-request-id')).toBe('request-labels')
    expect(body).toEqual({
      data: [{ id: 'urgent', name: 'Urgent', color: 'red' }],
      requestId: 'request-labels',
    })
    expect(mockCreateApiHandlerContext).toHaveBeenCalledWith(expect.any(Request), {
      allowedRoles: ['owner', 'admin'],
    })
  })
})
