'use client'

import { useMutation } from '@tanstack/react-query'
import { generateAssistantSuggestionsAction } from '../../actions'
import type { GenerateAssistantSuggestionsInput } from '../../application/types'
import type { AssistantSuggestionsResult } from '../../domain/assistant-suggestion'

export function useGenerateAssistantSuggestions() {
  return useMutation({
    mutationFn: (input: GenerateAssistantSuggestionsInput): Promise<AssistantSuggestionsResult> =>
      generateAssistantSuggestionsAction(input),
  })
}
