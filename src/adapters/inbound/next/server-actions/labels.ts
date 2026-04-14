'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseLabelsRepository } from '@/adapters/outbound/supabase/labels.repository'
import type { CreateLabel, Label, UpdateLabel } from '@/domain/label/label'
import { withAdminAuthContext } from '@/infrastructure/auth/with-auth'
import { createLabel, listLabels, updateLabel } from '@/use-cases/labels/labels'

function revalidateLabelRoutes() {
  revalidatePath('/admin/work-items')
  revalidatePath('/admin/work-items/archived')
}

export const getLabelsAction = withAdminAuthContext(async (ctx): Promise<Label[]> => {
  return listLabels({ labels: createSupabaseLabelsRepository(ctx.supabase) })
})

export const createLabelAction = withAdminAuthContext(
  async (ctx, input: CreateLabel): Promise<Label> => {
    const result = await createLabel(
      { labels: createSupabaseLabelsRepository(ctx.supabase) },
      input
    )
    revalidateLabelRoutes()
    return result
  }
)

export const updateLabelAction = withAdminAuthContext(
  async (ctx, id: string, input: UpdateLabel): Promise<Label> => {
    const result = await updateLabel(
      { labels: createSupabaseLabelsRepository(ctx.supabase) },
      id,
      input
    )
    revalidateLabelRoutes()
    return result
  }
)
