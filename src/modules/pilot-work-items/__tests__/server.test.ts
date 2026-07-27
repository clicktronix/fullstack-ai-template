import { describe, expect, mock, test } from 'bun:test'
import { AUTHORIZATION_ERROR } from '@/infrastructure/errors/codes'
import { createPilotWorkItemsServer } from '../server'

const item = {
  id: 'work-item-1',
  title: 'Pilot item',
  description: null,
  priority: false,
}

describe('pilot work-items server', () => {
  test('rejects unauthorized identity before data access', async () => {
    const list = mock(async () => [item])
    const server = createPilotWorkItemsServer({
      resolveRuntime: async () => ({
        identity: { role: 'member', userId: 'user-1' },
        store: { create: mock(async () => item), list },
      }),
    })

    await expect(server.list()).rejects.toThrow(`[${AUTHORIZATION_ERROR}]`)
    expect(list).not.toHaveBeenCalled()
  })

  test('returns cache ownership after a successful command', async () => {
    const create = mock(async () => item)
    const identity = { role: 'admin', userId: 'user-1' }
    const server = createPilotWorkItemsServer({
      resolveRuntime: async () => ({
        identity,
        store: { create, list: mock(async () => [item]) },
      }),
    })

    await expect(server.create({ title: 'Pilot item' })).resolves.toEqual({
      cacheScope: { id: item.id, userId: identity.userId },
      item,
    })
    expect(create).toHaveBeenCalledWith({ title: 'Pilot item' })
  })
})
