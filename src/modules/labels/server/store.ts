import 'server-only'

import { array, parse } from 'valibot'
import { throwIfError } from '@/shared/server/supabase/throw-supabase-error'
import type { SupabaseServerClient } from '@/shared/server/supabase/types'
import { LabelSchema, type CreateLabel, type Label, type UpdateLabel } from '../domain/label'

const LABEL_SELECT = Object.keys(LabelSchema.entries).join(', ')

export async function listLabelsFromStore(supabase: SupabaseServerClient): Promise<Label[]> {
  const { data, error } = await supabase.from('labels').select(LABEL_SELECT).order('name')

  throwIfError(error, 'get labels')

  return parse(array(LabelSchema), data)
}

export async function createLabelInStore(
  supabase: SupabaseServerClient,
  input: CreateLabel
): Promise<Label> {
  const { data, error } = await supabase
    .from('labels')
    .insert({
      name: input.name,
      color: input.color ?? null,
    })
    .select(LABEL_SELECT)
    .single()

  throwIfError(error, 'create label')

  return parse(LabelSchema, data)
}

export async function updateLabelInStore(
  supabase: SupabaseServerClient,
  id: string,
  input: UpdateLabel
): Promise<Label> {
  const { data, error } = await supabase
    .from('labels')
    .update({
      name: input.name,
      color: input.color ?? null,
    })
    .eq('id', id)
    .select(LABEL_SELECT)
    .single()

  throwIfError(error, 'update label')

  return parse(LabelSchema, data)
}
