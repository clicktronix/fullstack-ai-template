'use server'

import { readIdentityContext } from '@/modules/identity/server'
import { authActionClient, unwrapSafeActionResult } from '@/shared/server/actions/safe-action'
import {
  createSuggestions,
  GenerateAssistantSuggestionsInputSchema,
  type AssistantSuggestionsResult,
  type GenerateAssistantSuggestionsInput,
} from './server'

const safeGenerateAssistantSuggestionsAction = authActionClient
  .inputSchema(GenerateAssistantSuggestionsInputSchema)
  .action(async ({ ctx, parsedInput }): Promise<AssistantSuggestionsResult> => {
    const identity = await readIdentityContext({ supabase: ctx.supabase }, ctx.userId)
    return createSuggestions(identity, { supabase: ctx.supabase }, parsedInput)
  })

export async function generateAssistantSuggestionsAction(
  input: GenerateAssistantSuggestionsInput
): Promise<AssistantSuggestionsResult> {
  return unwrapSafeActionResult(await safeGenerateAssistantSuggestionsAction(input))
}
