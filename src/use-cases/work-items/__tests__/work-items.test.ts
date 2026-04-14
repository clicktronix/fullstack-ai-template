import { describe, expect, mock, test } from 'bun:test'
import {
  archiveWorkItem,
  createWorkItem,
  listWorkItems,
  restoreWorkItem,
  updateWorkItem,
} from '../work-items'

function createDeps() {
  const sampleItem = {
    id: 'work-item-1',
    title: 'Prepare launch checklist',
    description: 'Create a project bootstrap checklist',
    status: 'active' as const,
    is_priority: true,
    label_ids: ['label-1'],
    created_at: '2026-04-14T10:00:00.000Z',
    updated_at: '2026-04-14T10:00:00.000Z',
  }

  return {
    workItems: {
      list: mock(async () => ({ items: [sampleItem], total: 1, page: 1, pageSize: 20 })),
      getById: mock(async () => sampleItem),
      create: mock(async () => sampleItem),
      update: mock(async () => sampleItem),
      archive: mock(async () => ({ ...sampleItem, status: 'archived' as const })),
      restore: mock(async () => sampleItem),
    },
  }
}

describe('work items use-cases', () => {
  test('delegates list params to repository', async () => {
    const deps = createDeps()
    const result = await listWorkItems(deps, {
      search: 'launch',
      labelId: 'label-1',
      priorityOnly: true,
      status: 'active',
      page: 2,
      pageSize: 10,
    })

    expect(result.total).toBe(1)
    expect(deps.workItems.list).toHaveBeenCalledWith({
      search: 'launch',
      labelId: 'label-1',
      priorityOnly: true,
      status: 'active',
      page: 2,
      pageSize: 10,
    })
  })

  test('validates payload before create and update', async () => {
    const deps = createDeps()

    await createWorkItem(deps, {
      title: '  Build onboarding ',
      description: 'Write first-run docs',
      is_priority: false,
      label_ids: [],
    })

    await updateWorkItem(deps, 'work-item-1', {
      title: 'Refresh onboarding',
      is_priority: true,
    })

    expect(deps.workItems.create).toHaveBeenCalled()
    expect(deps.workItems.update).toHaveBeenCalled()
  })

  test('delegates archive and restore', async () => {
    const deps = createDeps()

    const archived = await archiveWorkItem(deps, 'work-item-1')
    const restored = await restoreWorkItem(deps, 'work-item-1')

    expect(archived.status).toBe('archived')
    expect(restored.status).toBe('active')
  })
})
