import { boolean, nullable, object, optional, picklist, string, type InferOutput } from 'valibot'

export const GenerateAssistantSuggestionsInputSchema = object({
  status: picklist(['active', 'archived']),
  search: optional(string()),
  labelId: optional(string()),
  priorityOnly: optional(boolean()),
  additionalContext: optional(nullable(string())),
})

export type GenerateAssistantSuggestionsInput = InferOutput<
  typeof GenerateAssistantSuggestionsInputSchema
>
