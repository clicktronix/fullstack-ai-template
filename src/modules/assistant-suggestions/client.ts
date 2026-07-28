'use client'

export { useGenerateAssistantSuggestions } from './client/query/mutations'
export type { GenerateAssistantSuggestionsInput } from './application/types'
export type {
  AssistantSuggestion,
  AssistantSuggestionPriority,
  AssistantSuggestionsResult,
} from './domain/assistant-suggestion'
