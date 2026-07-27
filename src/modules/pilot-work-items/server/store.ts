import 'server-only'

import { array, boolean, nullable, object, parse, string } from 'valibot'
import { throwIfError } from '@/adapters/supabase/throw-supabase-error'
import type { SupabaseServerClient, TablesInsert } from '@/adapters/supabase/types'
import {
  PilotWorkItemSchema,
  type CreatePilotWorkItem,
  type PilotWorkItem,
} from '../domain/work-item'

const PilotWorkItemRowSchema = object({
  id: string(),
  title: string(),
  description: nullable(string()),
  is_priority: boolean(),
})

const PILOT_WORK_ITEM_SELECT = 'id, title, description, is_priority'

function toPilotWorkItem(row: unknown): PilotWorkItem {
  const parsed = parse(PilotWorkItemRowSchema, row)
  return parse(PilotWorkItemSchema, {
    id: parsed.id,
    title: parsed.title,
    description: parsed.description,
    priority: parsed.is_priority,
  })
}

export function createPilotWorkItemsStore(supabase: SupabaseServerClient, userId: string) {
  return {
    async list(): Promise<PilotWorkItem[]> {
      const { data, error } = await supabase
        .from('work_items')
        .select(PILOT_WORK_ITEM_SELECT)
        .order('updated_at', { ascending: false })

      throwIfError(error, 'list pilot work items')
      return parse(
        array(PilotWorkItemSchema),
        (data ?? []).map((row) => toPilotWorkItem(row))
      )
    },

    async create(input: CreatePilotWorkItem): Promise<PilotWorkItem> {
      const payload: TablesInsert<'work_items'> = {
        title: input.title,
        description: input.description ?? null,
        is_priority: input.priority ?? false,
        created_by: userId,
      }
      const { data, error } = await supabase
        .from('work_items')
        .insert(payload)
        .select(PILOT_WORK_ITEM_SELECT)
        .single()

      throwIfError(error, 'create pilot work item')
      return toPilotWorkItem(data)
    },
  }
}
