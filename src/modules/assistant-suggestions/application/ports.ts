import type { AssistantSuggestionsResult } from '../domain/assistant-suggestion'
import type { GenerateAssistantSuggestionsInput } from './types'

export type SuggestionWorkItem = {
  id: string
  title: string
  description: string | null
  isPriority: boolean
  labelIds: string[]
}

export type SuggestionLabel = {
  id: string
  name: string
}

export type SuggestionSources = {
  listWorkItems: (input: {
    status: GenerateAssistantSuggestionsInput['status']
    search?: string
    labelId?: string
    priorityOnly?: boolean
    limit: number
  }) => Promise<SuggestionWorkItem[]>
  listLabels: () => Promise<SuggestionLabel[]>
}

export type SuggestionGenerator = {
  generate: (input: {
    workItems: SuggestionWorkItem[]
    labels: SuggestionLabel[]
    filters: GenerateAssistantSuggestionsInput
  }) => Promise<AssistantSuggestionsResult>
}
