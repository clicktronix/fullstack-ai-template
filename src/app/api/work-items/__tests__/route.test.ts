import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { createWorkItemsRouteHandlers, type WorkItemsRouteDependencies } from '../route'

const mockCreateApiHandlerContext = mock<WorkItemsRouteDependencies['createContext']>()
const mockRunIdempotentCommand = mock<WorkItemsRouteDependencies['runIdempotentCommand']>()
const mockListWorkItems = mock<WorkItemsRouteDependencies['listWorkItems']>()
const mockCreateWorkItem = mock<WorkItemsRouteDependencies['createWorkItem']>()
const mockReadIdentityContext = mock<WorkItemsRouteDependencies['readIdentityContext']>()

const context = {
  requestId: 'request-123',
  userId: 'user-123',
  supabase: {} as never,
}

describe('/api/work-items route handler', () => {
  beforeEach(() => {
    mockCreateApiHandlerContext.mockReset()
    mockRunIdempotentCommand.mockReset()
    mockListWorkItems.mockReset()
    mockCreateWorkItem.mockReset()
    mockReadIdentityContext.mockReset()
    mockCreateApiHandlerContext.mockResolvedValue(context)
    mockReadIdentityContext.mockResolvedValue({ actorId: 'user-123', role: 'admin' })
  })

  const { GET, POST } = createWorkItemsRouteHandlers({
    createContext: mockCreateApiHandlerContext,
    createWorkItem: mockCreateWorkItem,
    listWorkItems: mockListWorkItems,
    readIdentityContext: mockReadIdentityContext,
    runIdempotentCommand: mockRunIdempotentCommand,
  })

  test('GET maps query params through the use-case and returns a request-id envelope', async () => {
    mockListWorkItems.mockResolvedValue({
      items: [],
      total: 0,
      page: 2,
      pageSize: 10,
    })

    const response = await GET(
      new Request(
        'https://template.test/api/work-items?search=cache&status=active&page=2&pageSize=10&priorityOnly=true',
        { headers: { 'x-request-id': 'request-123' } }
      )
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('x-request-id')).toBe('request-123')
    expect(body).toEqual({
      data: {
        items: [],
        total: 0,
        page: 2,
        pageSize: 10,
      },
      requestId: 'request-123',
    })
    expect(mockListWorkItems).toHaveBeenCalledWith(
      { actorId: 'user-123', role: 'admin' },
      { supabase: context.supabase },
      {
        search: 'cache',
        status: 'active',
        page: 2,
        pageSize: 10,
        priorityOnly: true,
      }
    )
  })

  test.each([
    ['page', 'not-a-number'],
    ['pageSize', '0'],
    ['priorityOnly', 'yes'],
  ])('GET rejects an invalid %s query value', async (field, value) => {
    const response = await GET(
      new Request(`https://template.test/api/work-items?${field}=${value}`, {
        headers: { 'x-request-id': 'request-123' },
      })
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(mockListWorkItems).not.toHaveBeenCalled()
  })

  test('POST requires an Idempotency-Key header for service commands', async () => {
    const response = await POST(
      new Request('https://template.test/api/work-items', {
        method: 'POST',
        headers: { 'x-request-id': 'request-123' },
        body: JSON.stringify({ title: 'Backend task' }),
      })
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(mockRunIdempotentCommand).not.toHaveBeenCalled()
  })

  test('POST runs the command through idempotency and returns 201', async () => {
    const workItem = {
      id: 'work-item-1',
      title: 'Backend task',
      description: null,
      status: 'active' as const,
      is_priority: false,
      label_ids: [] as string[],
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }

    mockCreateWorkItem.mockResolvedValue(workItem)
    mockRunIdempotentCommand.mockImplementation(async ({ command }) => ({
      data: await command(),
      replayed: false,
    }))

    const response = await POST(
      new Request('https://template.test/api/work-items', {
        method: 'POST',
        headers: {
          'Idempotency-Key': 'create-work-item-1',
          'x-request-id': 'request-123',
        },
        body: JSON.stringify({ title: 'Backend task' }),
      })
    )
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(response.headers.get('x-idempotency-replayed')).toBe('false')
    expect(body).toEqual({ data: workItem, requestId: 'request-123' })
    expect(mockRunIdempotentCommand).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'create-work-item-1',
        method: 'POST',
        path: '/api/work-items',
        context,
      })
    )
    expect(mockCreateWorkItem).toHaveBeenCalledWith(
      { actorId: 'user-123', role: 'admin' },
      { supabase: context.supabase },
      { title: 'Backend task' }
    )
  })
})
