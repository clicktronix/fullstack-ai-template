import { parse } from 'valibot'
import {
  AssistantSuggestionsResultSchema,
  type AssistantSuggestionsResult,
} from '@/domain/assistant-suggestion/assistant-suggestion'
import type { AssistantSuggestionsGateway } from '@/use-cases/assistant-suggestions/ports'

const AI_SUGGESTIONS_API_URL = process.env.AI_SUGGESTIONS_API_URL
const AI_SUGGESTIONS_API_KEY = process.env.AI_SUGGESTIONS_API_KEY

function buildFallbackSuggestions(
  input: Parameters<AssistantSuggestionsGateway['generate']>[0]
): AssistantSuggestionsResult {
  const firstPriorityItem = input.workItems.find((item) => item.is_priority)
  const unlabeledItems = input.workItems.filter((item) => item.label_ids.length === 0)
  const matchingLabel = input.labels.find((label) => label.id === input.filters.labelId)

  const suggestions = [
    {
      id: 'focus-priority',
      title: firstPriorityItem
        ? `Start with "${firstPriorityItem.title}"`
        : 'Create one clear priority item',
      summary: firstPriorityItem
        ? 'Use the priority flag to keep the most important work visible at the top of the slice.'
        : 'The template works best when one item is marked as priority and tracked through the full stack.',
      priority: 'high' as const,
    },
    {
      id: 'improve-structure',
      title:
        unlabeledItems.length > 0
          ? `Label ${unlabeledItems.length} uncategorized item${unlabeledItems.length === 1 ? '' : 's'}`
          : 'Use labels to organize work by stream',
      summary: matchingLabel?.name
        ? `You are filtering by "${matchingLabel.name}". Consider keeping the label taxonomy small and opinionated.`
        : 'Labels are the reference-data part of this template. Keep them small, explicit, and reusable.',
      priority: 'medium' as const,
    },
    {
      id: 'capture-context',
      title: input.filters.additionalContext?.trim()
        ? 'Turn extra context into acceptance criteria'
        : 'Add a little product context before the next run',
      summary: input.filters.additionalContext?.trim()
        ? `Use this context as acceptance criteria: ${input.filters.additionalContext.trim()}`
        : 'The optional AI endpoint can consume extra context from the panel to return richer suggestions.',
      priority: 'low' as const,
    },
  ]

  return parse(AssistantSuggestionsResultSchema, {
    generated_at: new Date().toISOString(),
    suggestions,
  })
}

export function createAssistantSuggestionsGateway(): AssistantSuggestionsGateway {
  return {
    async generate(input) {
      if (AI_SUGGESTIONS_API_URL) {
        const response = await fetch(AI_SUGGESTIONS_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(AI_SUGGESTIONS_API_KEY
              ? { Authorization: `Bearer ${AI_SUGGESTIONS_API_KEY}` }
              : {}),
          },
          body: JSON.stringify(input),
        })

        if (response.ok) {
          return parse(AssistantSuggestionsResultSchema, await response.json())
        }

        throw new Error(
          `Assistant suggestions API error: ${response.status} ${response.statusText}`
        )
      }

      return buildFallbackSuggestions(input)
    },
  }
}
