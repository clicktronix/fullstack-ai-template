import { describe, expect, mock, test } from 'bun:test'

const mockList = mock()

mock.module('./server/store', () => ({
  listLabelsFromStore: mockList,
  createLabelInStore: mock(),
  updateLabelInStore: mock(),
}))

const { listLabels } = await import('./server')

const effects = { supabase: {} as never }

describe('labels server policy', () => {
  test('rejects a non-admin before store access', async () => {
    expect(() => listLabels({ actorId: 'user-1', role: 'pending' }, effects)).toThrow(
      '[AUTHORIZATION_ERROR] labels: insufficient role'
    )
    expect(mockList).not.toHaveBeenCalled()
  })

  test('allows an admin to list labels', async () => {
    const labels = [
      {
        id: 'label-1',
        name: 'Architecture',
        color: null,
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ]
    mockList.mockResolvedValueOnce(labels)

    await expect(listLabels({ actorId: 'user-1', role: 'admin' }, effects)).resolves.toBe(labels)
    expect(mockList).toHaveBeenCalledWith(effects.supabase)
  })
})
