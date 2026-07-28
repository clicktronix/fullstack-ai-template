'use server'

import { object, string } from 'valibot'
import { readIdentityContext } from '@/modules/identity/server'
import { authActionClient, unwrapSafeActionResult } from '@/shared/server/actions/safe-action'
import {
  archiveWorkItem,
  createWorkItem,
  restoreWorkItem,
  updateWorkItem,
  CreateWorkItemSchema,
  UpdateWorkItemSchema,
  type CreateWorkItem,
  type UpdateWorkItem,
  type WorkItem,
  type WorkItemsEffects,
} from './server'

const WorkItemIdSchema = object({
  id: string(),
})

const UpdateWorkItemActionInputSchema = object({
  id: string(),
  input: UpdateWorkItemSchema,
})

async function toCapabilityContext(ctx: {
  supabase: WorkItemsEffects['supabase']
  userId: string
}) {
  return {
    identity: await readIdentityContext({ supabase: ctx.supabase }, ctx.userId),
    effects: { supabase: ctx.supabase },
  }
}

const safeCreateWorkItemAction = authActionClient
  .inputSchema(CreateWorkItemSchema)
  .action(async ({ ctx, parsedInput }): Promise<WorkItem> => {
    const context = await toCapabilityContext(ctx)
    return createWorkItem(context.identity, context.effects, parsedInput)
  })

const safeUpdateWorkItemAction = authActionClient
  .inputSchema(UpdateWorkItemActionInputSchema)
  .action(async ({ ctx, parsedInput }): Promise<WorkItem> => {
    const context = await toCapabilityContext(ctx)
    return updateWorkItem(context.identity, context.effects, parsedInput.id, parsedInput.input)
  })

const safeArchiveWorkItemAction = authActionClient
  .inputSchema(WorkItemIdSchema)
  .action(async ({ ctx, parsedInput }): Promise<WorkItem> => {
    const context = await toCapabilityContext(ctx)
    return archiveWorkItem(context.identity, context.effects, parsedInput.id)
  })

const safeRestoreWorkItemAction = authActionClient
  .inputSchema(WorkItemIdSchema)
  .action(async ({ ctx, parsedInput }): Promise<WorkItem> => {
    const context = await toCapabilityContext(ctx)
    return restoreWorkItem(context.identity, context.effects, parsedInput.id)
  })

export async function createWorkItemAction(input: CreateWorkItem): Promise<WorkItem> {
  return unwrapSafeActionResult(await safeCreateWorkItemAction(input))
}

export async function updateWorkItemAction(id: string, input: UpdateWorkItem): Promise<WorkItem> {
  return unwrapSafeActionResult(await safeUpdateWorkItemAction({ id, input }))
}

export async function archiveWorkItemAction(id: string): Promise<WorkItem> {
  return unwrapSafeActionResult(await safeArchiveWorkItemAction({ id }))
}

export async function restoreWorkItemAction(id: string): Promise<WorkItem> {
  return unwrapSafeActionResult(await safeRestoreWorkItemAction({ id }))
}
