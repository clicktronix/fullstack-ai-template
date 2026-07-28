import { describe, expect, mock, test } from 'bun:test'

const mockList = mock()
const mockCreate = mock()

mock.module('./server/store', () => ({
  listWorkItemsFromStore: mockList,
  createWorkItemInStore: mockCreate,
  getWorkItemFromStore: mock(),
  updateWorkItemInStore: mock(),
  archiveWorkItemInStore: mock(),
  restoreWorkItemInStore: mock(),
}))

const { createWorkItem, listWorkItems } = await import('./server')

const effects = { supabase: {} as never }

describe('work-items server policy', () => {
  test('rejects a non-admin before store access', async () => {
    expect(() => listWorkItems({ actorId: 'user-1', role: 'pending' }, effects)).toThrow(
      '[AUTHORIZATION_ERROR] workItems: insufficient role'
    )
    expect(mockList).not.toHaveBeenCalled()
  })

  test('passes the authenticated actor to create', async () => {
    const input = { title: 'Ship capability migration' }
    const created = {
      id: 'work-item-1',
      title: input.title,
      description: null,
      status: 'active' as const,
      is_priority: false,
      label_ids: [],
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }
    mockCreate.mockResolvedValueOnce(created)

    await expect(
      createWorkItem({ actorId: 'user-1', role: 'admin' }, effects, input)
    ).resolves.toBe(created)
    expect(mockCreate).toHaveBeenCalledWith(effects.supabase, 'user-1', input)
  })
})
