'use server'

import { object, string } from 'valibot'
import { readIdentityContext } from '@/modules/identity/server'
import { authActionClient, unwrapSafeActionResult } from '@/shared/server/actions/safe-action'
import {
  createLabel,
  updateLabel,
  CreateLabelSchema,
  UpdateLabelSchema,
  type CreateLabel,
  type Label,
  type UpdateLabel,
} from './server'

const UpdateLabelActionInputSchema = object({
  id: string(),
  input: UpdateLabelSchema,
})

const safeCreateLabelAction = authActionClient
  .inputSchema(CreateLabelSchema)
  .action(async ({ ctx, parsedInput }): Promise<Label> => {
    const identity = await readIdentityContext({ supabase: ctx.supabase }, ctx.userId)
    return createLabel(identity, { supabase: ctx.supabase }, parsedInput)
  })

const safeUpdateLabelAction = authActionClient
  .inputSchema(UpdateLabelActionInputSchema)
  .action(async ({ ctx, parsedInput }): Promise<Label> => {
    const identity = await readIdentityContext({ supabase: ctx.supabase }, ctx.userId)
    return updateLabel(identity, { supabase: ctx.supabase }, parsedInput.id, parsedInput.input)
  })

export async function createLabelAction(input: CreateLabel): Promise<Label> {
  return unwrapSafeActionResult(await safeCreateLabelAction(input))
}

export async function updateLabelAction(id: string, input: UpdateLabel): Promise<Label> {
  return unwrapSafeActionResult(await safeUpdateLabelAction({ id, input }))
}
