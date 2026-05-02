'use server'

import { revalidateTag, updateTag } from 'next/cache'
import { boolean, number, object, optional, string } from 'valibot'
import { createSupabaseWorkItemsRepository } from '@/adapters/outbound/supabase/work-items.repository'
import {
  CreateWorkItemSchema,
  WorkItemStatusSchema,
  type CreateWorkItem,
  type UpdateWorkItem,
  UpdateWorkItemSchema,
  type WorkItem,
} from '@/domain/work-item/work-item'
import { adminActionClient, unwrapSafeActionResult } from '@/infrastructure/actions/safe-action'
import { cacheTags } from '@/infrastructure/cache/tags'
import type { PaginatedWorkItemsResult, WorkItemListParams } from '@/use-cases/work-items/types'
import {
  archiveWorkItem,
  createWorkItem,
  getWorkItem,
  listWorkItems,
  restoreWorkItem,
  updateWorkItem,
} from '@/use-cases/work-items/work-items'

const WorkItemListParamsSchema = optional(
  object({
    search: optional(string()),
    labelId: optional(string()),
    priorityOnly: optional(boolean()),
    status: optional(WorkItemStatusSchema),
    page: optional(number()),
    pageSize: optional(number()),
  })
)

const WorkItemIdSchema = object({
  id: string(),
})

const UpdateWorkItemActionInputSchema = object({
  id: string(),
  input: UpdateWorkItemSchema,
})

function revalidateWorkItemsCache(userId: string, id?: string) {
  updateTag(cacheTags.workItems.user(userId))
  updateTag(cacheTags.workItems.lists(userId))
  revalidateTag(cacheTags.workItems.all, 'minutes')

  if (id) {
    updateTag(cacheTags.workItems.detail(userId, id))
  }
}

const safeGetWorkItemsAction = adminActionClient
  .inputSchema(WorkItemListParamsSchema)
  .action(async ({ ctx, parsedInput }): Promise<PaginatedWorkItemsResult> => {
    return listWorkItems(
      { workItems: createSupabaseWorkItemsRepository(ctx.supabase, ctx.userId) },
      parsedInput
    )
  })

const safeGetWorkItemAction = adminActionClient
  .inputSchema(WorkItemIdSchema)
  .action(async ({ ctx, parsedInput }): Promise<WorkItem> => {
    return getWorkItem(
      { workItems: createSupabaseWorkItemsRepository(ctx.supabase, ctx.userId) },
      parsedInput.id
    )
  })

const safeCreateWorkItemAction = adminActionClient
  .inputSchema(CreateWorkItemSchema)
  .action(async ({ ctx, parsedInput }): Promise<WorkItem> => {
    const result = await createWorkItem(
      { workItems: createSupabaseWorkItemsRepository(ctx.supabase, ctx.userId) },
      parsedInput
    )
    revalidateWorkItemsCache(ctx.userId, result.id)
    return result
  })

const safeUpdateWorkItemAction = adminActionClient
  .inputSchema(UpdateWorkItemActionInputSchema)
  .action(async ({ ctx, parsedInput }): Promise<WorkItem> => {
    const result = await updateWorkItem(
      { workItems: createSupabaseWorkItemsRepository(ctx.supabase, ctx.userId) },
      parsedInput.id,
      parsedInput.input
    )
    revalidateWorkItemsCache(ctx.userId, parsedInput.id)
    return result
  })

const safeArchiveWorkItemAction = adminActionClient
  .inputSchema(WorkItemIdSchema)
  .action(async ({ ctx, parsedInput }): Promise<WorkItem> => {
    const result = await archiveWorkItem(
      { workItems: createSupabaseWorkItemsRepository(ctx.supabase, ctx.userId) },
      parsedInput.id
    )
    revalidateWorkItemsCache(ctx.userId, parsedInput.id)
    return result
  })

const safeRestoreWorkItemAction = adminActionClient
  .inputSchema(WorkItemIdSchema)
  .action(async ({ ctx, parsedInput }): Promise<WorkItem> => {
    const result = await restoreWorkItem(
      { workItems: createSupabaseWorkItemsRepository(ctx.supabase, ctx.userId) },
      parsedInput.id
    )
    revalidateWorkItemsCache(ctx.userId, parsedInput.id)
    return result
  })

export async function getWorkItemsAction(
  params?: WorkItemListParams
): Promise<PaginatedWorkItemsResult> {
  return unwrapSafeActionResult(await safeGetWorkItemsAction(params))
}

export async function getWorkItemAction(id: string): Promise<WorkItem> {
  return unwrapSafeActionResult(await safeGetWorkItemAction({ id }))
}

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
