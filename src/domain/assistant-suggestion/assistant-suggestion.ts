import {
  array,
  isoTimestamp,
  nullable,
  object,
  picklist,
  pipe,
  string,
  trim,
  minLength,
  type InferOutput,
} from 'valibot'

export const AssistantSuggestionPrioritySchema = picklist(['high', 'medium', 'low'])

export const AssistantSuggestionSchema = object({
  id: string(),
  title: pipe(string(), trim(), minLength(1)),
  summary: nullable(string()),
  priority: AssistantSuggestionPrioritySchema,
})

export const AssistantSuggestionsResultSchema = object({
  generated_at: pipe(string(), isoTimestamp()),
  suggestions: array(AssistantSuggestionSchema),
})

export type AssistantSuggestion = InferOutput<typeof AssistantSuggestionSchema>
export type AssistantSuggestionPriority = InferOutput<typeof AssistantSuggestionPrioritySchema>
export type AssistantSuggestionsResult = InferOutput<typeof AssistantSuggestionsResultSchema>
