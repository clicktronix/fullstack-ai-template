import { describe, expect, mock, test } from 'bun:test'
import { createHttpWorkItemsRepository } from '../work-items.repository'

const workItem = {
  id: 'work-item-1',
  title: 'Remote item',
  description: null,
  status: 'active' as const,
  is_priority: false,
  label_ids: [],
  due_at: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
}

describe('HTTP work-items repository', () => {
  test('maps the repository contract to authenticated provider requests', async () => {
    const fetcher = mock(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input))
      if (url.pathname === '/work-items' && init?.method !== 'POST') {
        return Response.json({ items: [workItem], total: 1, page: 1, pageSize: 20 })
      }
      return Response.json(workItem, { status: init?.method === 'POST' ? 201 : 200 })
    })
    const repository = createHttpWorkItemsRepository({
      baseUrl: 'https://work-items.test',
      userId: 'user-1',
      fetcher,
    })

    const page = await repository.list({ status: 'active', page: 1 })
    const created = await repository.create({ title: 'Remote item' })

    expect(page.items).toEqual([workItem])
    expect(created).toEqual(workItem)
    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      new URL('https://work-items.test/work-items?status=active&page=1'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-user-id': 'user-1' }),
      })
    )
  })
})
