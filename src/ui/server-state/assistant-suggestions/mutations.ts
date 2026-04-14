'use client'

import { useMutation } from '@tanstack/react-query'
import { generateAssistantSuggestionsAction } from '@/adapters/inbound/next/server-actions/assistant-suggestions'
import type { AssistantSuggestionsResult } from '@/domain/assistant-suggestion/assistant-suggestion'
import type { GenerateAssistantSuggestionsInput } from '@/use-cases/assistant-suggestions/types'

export function useGenerateAssistantSuggestions() {
  return useMutation({
    mutationFn: (input: GenerateAssistantSuggestionsInput): Promise<AssistantSuggestionsResult> =>
      generateAssistantSuggestionsAction(input),
  })
}
