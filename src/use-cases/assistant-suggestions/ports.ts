import type { AssistantSuggestionsResult } from '@/domain/assistant-suggestion/assistant-suggestion'
import type { Label } from '@/domain/label/label'
import type { WorkItem } from '@/domain/work-item/work-item'
import type { WorkItemListParams } from '@/use-cases/work-items/types'
import type { GenerateAssistantSuggestionsInput } from './types'

export type AssistantSuggestionsGateway = {
  generate: (input: {
    workItems: WorkItem[]
    labels: Label[]
    filters: GenerateAssistantSuggestionsInput
  }) => Promise<AssistantSuggestionsResult>
}

export type AssistantSuggestionsWorkItemsRepository = {
  list: (params: WorkItemListParams) => Promise<{
    items: WorkItem[]
    total: number
    page: number
    pageSize: number
  }>
}

export type AssistantSuggestionsLabelsRepository = {
  list: () => Promise<Label[]>
}
