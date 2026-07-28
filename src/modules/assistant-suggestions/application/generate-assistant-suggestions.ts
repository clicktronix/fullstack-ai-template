import type { SuggestionGenerator, SuggestionSources } from './ports'
import type { GenerateAssistantSuggestionsInput } from './types'

type GenerateAssistantSuggestionsDeps = {
  sources: SuggestionSources
  generator: SuggestionGenerator
}

export async function generateAssistantSuggestions(
  deps: GenerateAssistantSuggestionsDeps,
  input: GenerateAssistantSuggestionsInput
) {
  const [workItems, labels] = await Promise.all([
    deps.sources.listWorkItems({
      status: input.status,
      search: input.search,
      labelId: input.labelId,
      priorityOnly: input.priorityOnly,
      limit: 8,
    }),
    deps.sources.listLabels(),
  ])

  return deps.generator.generate({ workItems, labels, filters: input })
}
