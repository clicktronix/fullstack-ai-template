import { beforeEach, describe, expect, mock, test } from 'bun:test'

const mockCreateApiHandlerContext = mock()
const mockRunIdempotentCommand = mock()
const mockListWorkItems = mock()
const mockCreateWorkItem = mock()
const mockRevalidateTag = mock()

mock.module('@/infrastructure/api/context', () => ({
  createApiHandlerContext: mockCreateApiHandlerContext,
  getRequestId: () => 'request-123',
}))

mock.module('@/infrastructure/api/idempotency', () => ({
  runIdempotentCommand: mockRunIdempotentCommand,
}))

mock.module('@/use-cases/work-items/work-items', () => ({
  listWorkItems: mockListWorkItems,
  createWorkItem: mockCreateWorkItem,
}))

mock.module('next/cache', () => ({
  revalidateTag: mockRevalidateTag,
}))

const { GET, POST } = await import('../route')

const context = {
  requestId: 'request-123',
  userId: 'user-123',
  role: 'admin',
  supabase: {},
}

describe('/api/work-items route handler', () => {
  beforeEach(() => {
    mockCreateApiHandlerContext.mockReset()
    mockRunIdempotentCommand.mockReset()
    mockListWorkItems.mockReset()
    mockCreateWorkItem.mockReset()
    mockRevalidateTag.mockReset()
    mockCreateApiHandlerContext.mockResolvedValue(context)
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
        'https://template.test/api/work-items?search=cache&status=active&page=2&pageSize=10&priorityOnly=true'
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
    expect(mockListWorkItems).toHaveBeenCalledWith(expect.any(Object), {
      search: 'cache',
      status: 'active',
      page: 2,
      pageSize: 10,
      priorityOnly: true,
    })
  })

  test('POST requires an Idempotency-Key header for service commands', async () => {
    const response = await POST(
      new Request('https://template.test/api/work-items', {
        method: 'POST',
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
      status: 'active',
      is_priority: false,
      label_ids: [],
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }

    mockCreateWorkItem.mockResolvedValue(workItem)
    mockRunIdempotentCommand.mockImplementation(
      async ({ command }: { command: () => Promise<typeof workItem> }) => ({
        data: await command(),
        replayed: false,
      })
    )

    const response = await POST(
      new Request('https://template.test/api/work-items', {
        method: 'POST',
        headers: { 'Idempotency-Key': 'create-work-item-1' },
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
    expect(mockCreateWorkItem).toHaveBeenCalledWith(expect.any(Object), {
      title: 'Backend task',
    })
    expect(mockRevalidateTag).toHaveBeenCalledWith('work-items:user:user-123', 'minutes')
    expect(mockRevalidateTag).toHaveBeenCalledWith('work-items:user:user-123:lists', 'minutes')
    expect(mockRevalidateTag).toHaveBeenCalledWith('work-items', 'minutes')
    expect(mockRevalidateTag).toHaveBeenCalledWith(
      'work-items:user:user-123:detail:work-item-1',
      'minutes'
    )
  })
})
