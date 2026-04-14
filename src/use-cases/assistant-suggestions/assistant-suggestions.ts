import type { AssistantSuggestionsResult } from '@/domain/assistant-suggestion/assistant-suggestion'
import type {
  AssistantSuggestionsGateway,
  AssistantSuggestionsLabelsRepository,
  AssistantSuggestionsWorkItemsRepository,
} from './ports'
import type { GenerateAssistantSuggestionsInput } from './types'

type AssistantSuggestionsDeps = {
  workItems: AssistantSuggestionsWorkItemsRepository
  labels: AssistantSuggestionsLabelsRepository
  assistantSuggestions: AssistantSuggestionsGateway
}

export async function generateAssistantSuggestions(
  deps: AssistantSuggestionsDeps,
  input: GenerateAssistantSuggestionsInput
): Promise<AssistantSuggestionsResult> {
  const [workItemsResult, labels] = await Promise.all([
    deps.workItems.list({
      status: input.status,
      search: input.search,
      labelId: input.labelId,
      priorityOnly: input.priorityOnly,
      page: 1,
      pageSize: 8,
    }),
    deps.labels.list(),
  ])

  return deps.assistantSuggestions.generate({
    workItems: workItemsResult.items,
    labels,
    filters: input,
  })
}
