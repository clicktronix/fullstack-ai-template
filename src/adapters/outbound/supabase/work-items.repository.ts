import type { SupabaseServerClient } from '@/adapters/supabase/types'
import type { WorkItemsRepository } from '@/use-cases/work-items/ports'
import {
  archiveWorkItemOperation,
  createWorkItemOperation,
  getWorkItemOperation,
  listWorkItemsOperation,
  restoreWorkItemOperation,
  updateWorkItemOperation,
} from './work-items.operations'

export function createSupabaseWorkItemsRepository(
  supabase: SupabaseServerClient,
  userId: string
): WorkItemsRepository {
  return {
    list: (params) => listWorkItemsOperation(supabase, params),
    getById: (id) => getWorkItemOperation(supabase, id),
    create: (input) => createWorkItemOperation(supabase, userId, input),
    update: (id, input) => updateWorkItemOperation(supabase, id, input),
    archive: (id) => archiveWorkItemOperation(supabase, id),
    restore: (id) => restoreWorkItemOperation(supabase, id),
  }
}
