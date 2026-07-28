import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { createLabelsRouteHandler, type LabelsRouteDependencies } from './route'

const mockCreateContext = mock<LabelsRouteDependencies['createContext']>()
const mockListLabels = mock<LabelsRouteDependencies['listLabels']>()
const mockReadIdentityContext = mock<LabelsRouteDependencies['readIdentityContext']>()
const GET = createLabelsRouteHandler({
  createContext: mockCreateContext,
  listLabels: mockListLabels,
  readIdentityContext: mockReadIdentityContext,
})

describe('/api/labels', () => {
  beforeEach(() => {
    mockCreateContext.mockReset()
    mockListLabels.mockReset()
    mockReadIdentityContext.mockReset()
  })

  test('uses authenticated context and returns labels', async () => {
    const context = {
      requestId: 'request-123',
      userId: 'user-1',
      supabase: {} as never,
    }
    const labels = [
      {
        id: 'label-1',
        name: 'Architecture',
        color: null,
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ]
    mockCreateContext.mockResolvedValueOnce(context)
    mockReadIdentityContext.mockResolvedValueOnce({ actorId: 'user-1', role: 'admin' })
    mockListLabels.mockResolvedValueOnce(labels)

    const response = await GET(
      new Request('https://template.test/api/labels', {
        headers: { 'x-request-id': 'request-123' },
      })
    )

    expect(response.status).toBe(200)
    expect(mockCreateContext).toHaveBeenCalledWith(expect.any(Request))
    expect(mockListLabels).toHaveBeenCalledWith(
      { actorId: 'user-1', role: 'admin' },
      { supabase: context.supabase }
    )
    expect(await response.json()).toEqual({ data: labels, requestId: 'request-123' })
  })
})
