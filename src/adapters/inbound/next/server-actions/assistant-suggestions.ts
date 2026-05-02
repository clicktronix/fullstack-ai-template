'use server'

import { boolean, nullable, object, optional, string } from 'valibot'
import { createAssistantSuggestionsGateway } from '@/adapters/outbound/api/assistant-suggestions'
import { createSupabaseLabelsRepository } from '@/adapters/outbound/supabase/labels.repository'
import { createSupabaseWorkItemsRepository } from '@/adapters/outbound/supabase/work-items.repository'
import type { AssistantSuggestionsResult } from '@/domain/assistant-suggestion/assistant-suggestion'
import { WorkItemStatusSchema } from '@/domain/work-item/work-item'
import { adminActionClient, unwrapSafeActionResult } from '@/infrastructure/actions/safe-action'
import { generateAssistantSuggestions } from '@/use-cases/assistant-suggestions/assistant-suggestions'
import type { GenerateAssistantSuggestionsInput } from '@/use-cases/assistant-suggestions/types'

const GenerateAssistantSuggestionsInputSchema = object({
  status: WorkItemStatusSchema,
  search: optional(string()),
  labelId: optional(string()),
  priorityOnly: optional(boolean()),
  additionalContext: optional(nullable(string())),
})

const safeGenerateAssistantSuggestionsAction = adminActionClient
  .inputSchema(GenerateAssistantSuggestionsInputSchema)
  .action(async ({ ctx, parsedInput }): Promise<AssistantSuggestionsResult> => {
    return generateAssistantSuggestions(
      {
        workItems: createSupabaseWorkItemsRepository(ctx.supabase, ctx.userId),
        labels: createSupabaseLabelsRepository(ctx.supabase),
        assistantSuggestions: createAssistantSuggestionsGateway(ctx.userId),
      },
      parsedInput
    )
  })

export async function generateAssistantSuggestionsAction(
  input: GenerateAssistantSuggestionsInput
): Promise<AssistantSuggestionsResult> {
  return unwrapSafeActionResult(await safeGenerateAssistantSuggestionsAction(input))
}
