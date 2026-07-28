import { describe, expect, mock, test } from 'bun:test'
import { createWorkItemRouteHandler, type WorkItemRouteDependencies } from './route'

const mockCreateContext = mock<WorkItemRouteDependencies['createContext']>()
const mockGetWorkItem = mock<WorkItemRouteDependencies['getWorkItem']>()
const mockReadIdentityContext = mock<WorkItemRouteDependencies['readIdentityContext']>()
const GET = createWorkItemRouteHandler({
  createContext: mockCreateContext,
  getWorkItem: mockGetWorkItem,
  readIdentityContext: mockReadIdentityContext,
})

describe('/api/work-items/[id]', () => {
  test('resolves params and returns the capability result', async () => {
    const context = {
      requestId: 'request-123',
      userId: 'user-1',
      supabase: {} as never,
    }
    const workItem = {
      id: 'work-item-1',
      title: 'Architecture',
      description: null,
      status: 'active' as const,
      is_priority: false,
      label_ids: [] as string[],
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }
    mockCreateContext.mockResolvedValueOnce(context)
    mockReadIdentityContext.mockResolvedValueOnce({ actorId: 'user-1', role: 'admin' })
    mockGetWorkItem.mockResolvedValueOnce(workItem)

    const response = await GET(
      new Request('https://template.test/api/work-items/work-item-1', {
        headers: { 'x-request-id': 'request-123' },
      }),
      {
        params: Promise.resolve({ id: 'work-item-1' }),
      }
    )

    expect(response.status).toBe(200)
    expect(mockGetWorkItem).toHaveBeenCalledWith(
      { actorId: 'user-1', role: 'admin' },
      { supabase: context.supabase },
      'work-item-1'
    )
    expect(await response.json()).toEqual({ data: workItem, requestId: 'request-123' })
  })
})
