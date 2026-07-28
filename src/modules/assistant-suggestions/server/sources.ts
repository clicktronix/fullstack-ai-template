import 'server-only'

import { listLabels, type LabelsEffects, type LabelsIdentity } from '@/modules/labels/server'
import {
  listWorkItems,
  type WorkItemsEffects,
  type WorkItemsIdentity,
} from '@/modules/work-items/server'
import type { SuggestionSources } from '../application/ports'

type SourceContext = {
  identity: WorkItemsIdentity & LabelsIdentity
  effects: WorkItemsEffects & LabelsEffects
}

export function createSuggestionSources(context: SourceContext): SuggestionSources {
  return {
    async listWorkItems(input) {
      const result = await listWorkItems(context.identity, context.effects, {
        status: input.status,
        search: input.search,
        labelId: input.labelId,
        priorityOnly: input.priorityOnly,
        page: 1,
        pageSize: input.limit,
      })
      return result.items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        isPriority: item.is_priority,
        labelIds: item.label_ids,
      }))
    },
    async listLabels() {
      const labels = await listLabels(context.identity, context.effects)
      return labels.map((label) => ({ id: label.id, name: label.name }))
    },
  }
}
