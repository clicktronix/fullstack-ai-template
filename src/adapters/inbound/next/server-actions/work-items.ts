'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseWorkItemsRepository } from '@/adapters/outbound/supabase/work-items.repository'
import type { CreateWorkItem, UpdateWorkItem, WorkItem } from '@/domain/work-item/work-item'
import { withAdminAuthContext } from '@/infrastructure/auth/with-auth'
import type { PaginatedWorkItemsResult, WorkItemListParams } from '@/use-cases/work-items/types'
import {
  archiveWorkItem,
  createWorkItem,
  getWorkItem,
  listWorkItems,
  restoreWorkItem,
  updateWorkItem,
} from '@/use-cases/work-items/work-items'

function revalidateWorkItemsRoutes() {
  revalidatePath('/admin/work-items')
  revalidatePath('/admin/work-items/archived')
}

export const getWorkItemsAction = withAdminAuthContext(
  async (ctx, params?: WorkItemListParams): Promise<PaginatedWorkItemsResult> => {
    return listWorkItems(
      { workItems: createSupabaseWorkItemsRepository(ctx.supabase, ctx.userId) },
      params
    )
  }
)

export const getWorkItemAction = withAdminAuthContext(
  async (ctx, id: string): Promise<WorkItem> => {
    return getWorkItem(
      { workItems: createSupabaseWorkItemsRepository(ctx.supabase, ctx.userId) },
      id
    )
  }
)

export const createWorkItemAction = withAdminAuthContext(
  async (ctx, input: CreateWorkItem): Promise<WorkItem> => {
    const result = await createWorkItem(
      { workItems: createSupabaseWorkItemsRepository(ctx.supabase, ctx.userId) },
      input
    )
    revalidateWorkItemsRoutes()
    return result
  }
)

export const updateWorkItemAction = withAdminAuthContext(
  async (ctx, id: string, input: UpdateWorkItem): Promise<WorkItem> => {
    const result = await updateWorkItem(
      { workItems: createSupabaseWorkItemsRepository(ctx.supabase, ctx.userId) },
      id,
      input
    )
    revalidateWorkItemsRoutes()
    return result
  }
)

export const archiveWorkItemAction = withAdminAuthContext(
  async (ctx, id: string): Promise<WorkItem> => {
    const result = await archiveWorkItem(
      { workItems: createSupabaseWorkItemsRepository(ctx.supabase, ctx.userId) },
      id
    )
    revalidateWorkItemsRoutes()
    return result
  }
)

export const restoreWorkItemAction = withAdminAuthContext(
  async (ctx, id: string): Promise<WorkItem> => {
    const result = await restoreWorkItem(
      { workItems: createSupabaseWorkItemsRepository(ctx.supabase, ctx.userId) },
      id
    )
    revalidateWorkItemsRoutes()
    return result
  }
)
