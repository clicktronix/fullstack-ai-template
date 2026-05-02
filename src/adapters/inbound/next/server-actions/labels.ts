'use server'

import { revalidateTag, updateTag } from 'next/cache'
import { object, string } from 'valibot'
import { createSupabaseLabelsRepository } from '@/adapters/outbound/supabase/labels.repository'
import {
  CreateLabelSchema,
  type CreateLabel,
  type Label,
  UpdateLabelSchema,
  type UpdateLabel,
} from '@/domain/label/label'
import { adminActionClient, unwrapSafeActionResult } from '@/infrastructure/actions/safe-action'
import { cacheTags } from '@/infrastructure/cache/tags'
import { createLabel, listLabels, updateLabel } from '@/use-cases/labels/labels'

const UpdateLabelActionInputSchema = object({
  id: string(),
  input: UpdateLabelSchema,
})

function revalidateLabelsCache(userId: string, id?: string) {
  updateTag(cacheTags.labels.list)
  updateTag(cacheTags.workItems.lists(userId))
  revalidateTag(cacheTags.labels.all, 'minutes')
  revalidateTag(cacheTags.workItems.all, 'minutes')

  if (id) {
    updateTag(cacheTags.labels.detail(id))
  }
}

const safeGetLabelsAction = adminActionClient.action(async ({ ctx }): Promise<Label[]> => {
  return listLabels({ labels: createSupabaseLabelsRepository(ctx.supabase) })
})

const safeCreateLabelAction = adminActionClient
  .inputSchema(CreateLabelSchema)
  .action(async ({ ctx, parsedInput }): Promise<Label> => {
    const result = await createLabel(
      { labels: createSupabaseLabelsRepository(ctx.supabase) },
      parsedInput
    )
    revalidateLabelsCache(ctx.userId, result.id)
    return result
  })

const safeUpdateLabelAction = adminActionClient
  .inputSchema(UpdateLabelActionInputSchema)
  .action(async ({ ctx, parsedInput }): Promise<Label> => {
    const result = await updateLabel(
      { labels: createSupabaseLabelsRepository(ctx.supabase) },
      parsedInput.id,
      parsedInput.input
    )
    revalidateLabelsCache(ctx.userId, parsedInput.id)
    return result
  })

export async function getLabelsAction(): Promise<Label[]> {
  return unwrapSafeActionResult(await safeGetLabelsAction())
}

export async function createLabelAction(input: CreateLabel): Promise<Label> {
  return unwrapSafeActionResult(await safeCreateLabelAction(input))
}

export async function updateLabelAction(id: string, input: UpdateLabel): Promise<Label> {
  return unwrapSafeActionResult(await safeUpdateLabelAction({ id, input }))
}
