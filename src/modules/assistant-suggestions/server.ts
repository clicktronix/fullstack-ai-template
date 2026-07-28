import 'server-only'

import { createActionError } from '@/shared/kernel/errors/action-error'
import { AUTHORIZATION_ERROR } from '@/shared/kernel/errors/codes'
import type { SupabaseServerClient } from '@/shared/server/supabase/types'
import { generateAssistantSuggestions } from './application/generate-assistant-suggestions'
import {
  GenerateAssistantSuggestionsInputSchema,
  type GenerateAssistantSuggestionsInput,
} from './application/types'
import type { AssistantSuggestionsResult } from './domain/assistant-suggestion'
import { createAssistantSuggestionsGateway } from './server/provider'
import { createSuggestionSources } from './server/sources'

export type AssistantIdentity = {
  actorId: string
  role: string
}

export type AssistantEffects = {
  supabase: SupabaseServerClient
}

export function createSuggestions(
  identity: AssistantIdentity,
  effects: AssistantEffects,
  input: GenerateAssistantSuggestionsInput
): Promise<AssistantSuggestionsResult> {
  if (identity.role !== 'owner' && identity.role !== 'admin') {
    throw createActionError(AUTHORIZATION_ERROR, 'assistantSuggestions: insufficient role')
  }

  return generateAssistantSuggestions(
    {
      sources: createSuggestionSources({ identity, effects }),
      generator: createAssistantSuggestionsGateway(identity.actorId),
    },
    input
  )
}

export {
  GenerateAssistantSuggestionsInputSchema,
  type GenerateAssistantSuggestionsInput,
  type AssistantSuggestionsResult,
}
