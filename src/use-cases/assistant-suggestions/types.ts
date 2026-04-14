import type { WorkItemStatus } from '@/domain/work-item/work-item'

export type GenerateAssistantSuggestionsInput = {
  status: WorkItemStatus
  search?: string
  labelId?: string
  priorityOnly?: boolean
  additionalContext?: string | null
}
