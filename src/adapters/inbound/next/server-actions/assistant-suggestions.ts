'use server'

import { createAssistantSuggestionsGateway } from '@/adapters/outbound/api/assistant-suggestions'
import { createSupabaseLabelsRepository } from '@/adapters/outbound/supabase/labels.repository'
import { createSupabaseWorkItemsRepository } from '@/adapters/outbound/supabase/work-items.repository'
import type { AssistantSuggestionsResult } from '@/domain/assistant-suggestion/assistant-suggestion'
import { withAdminAuthContext } from '@/infrastructure/auth/with-auth'
import { generateAssistantSuggestions } from '@/use-cases/assistant-suggestions/assistant-suggestions'
import type { GenerateAssistantSuggestionsInput } from '@/use-cases/assistant-suggestions/types'

export const generateAssistantSuggestionsAction = withAdminAuthContext(
  async (ctx, input: GenerateAssistantSuggestionsInput): Promise<AssistantSuggestionsResult> => {
    return generateAssistantSuggestions(
      {
        workItems: createSupabaseWorkItemsRepository(ctx.supabase, ctx.userId),
        labels: createSupabaseLabelsRepository(ctx.supabase),
        assistantSuggestions: createAssistantSuggestionsGateway(),
      },
      input
    )
  }
)
