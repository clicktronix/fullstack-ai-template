import { describe, expect, mock, test } from 'bun:test'
import { generateAssistantSuggestions } from './generate-assistant-suggestions'

describe('assistant suggestions use-case', () => {
  test('combines filtered work items and labels before calling gateway', async () => {
    const workItems = [
      {
        id: 'item-1',
        title: 'Ship onboarding',
        description: 'Finalize first-run experience',
        status: 'active' as const,
        is_priority: true,
        label_ids: ['label-1'],
        created_at: '2026-04-14T10:00:00.000Z',
        updated_at: '2026-04-14T10:00:00.000Z',
      },
    ]

    const labels = [
      {
        id: 'label-1',
        name: 'Product',
        color: 'blue',
        created_at: '2026-04-14T10:00:00.000Z',
      },
    ]

    const deps = {
      sources: {
        listWorkItems: mock(async () =>
          workItems.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            isPriority: item.is_priority,
            labelIds: item.label_ids,
          }))
        ),
        listLabels: mock(async () => labels.map((label) => ({ id: label.id, name: label.name }))),
      },
      generator: {
        generate: mock(async () => ({
          generated_at: '2026-04-14T10:00:00.000Z',
          suggestions: [
            {
              id: 'suggestion-1',
              title: 'Focus on onboarding',
              summary: 'Use the Product label to keep launch work visible.',
              priority: 'high' as const,
            },
          ],
        })),
      },
    }

    const result = await generateAssistantSuggestions(deps, {
      status: 'active',
      search: 'onboarding',
      labelId: 'label-1',
      priorityOnly: true,
      additionalContext: 'Launch this week',
    })

    expect(result.suggestions).toHaveLength(1)
    expect(deps.sources.listWorkItems).toHaveBeenCalledWith({
      status: 'active',
      search: 'onboarding',
      labelId: 'label-1',
      priorityOnly: true,
      limit: 8,
    })
    expect(deps.generator.generate).toHaveBeenCalledWith({
      workItems: [
        {
          id: 'item-1',
          title: 'Ship onboarding',
          description: 'Finalize first-run experience',
          isPriority: true,
          labelIds: ['label-1'],
        },
      ],
      labels: [{ id: 'label-1', name: 'Product' }],
      filters: {
        status: 'active',
        search: 'onboarding',
        labelId: 'label-1',
        priorityOnly: true,
        additionalContext: 'Launch this week',
      },
    })
  })
})
