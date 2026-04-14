import 'server-only'

import { array, parse } from 'valibot'
import { throwIfError } from '@/adapters/supabase/throw-supabase-error'
import type { SupabaseServerClient } from '@/adapters/supabase/types'
import { LabelSchema, type CreateLabel, type Label, type UpdateLabel } from '@/domain/label/label'

const LABEL_SELECT = Object.keys(LabelSchema.entries).join(', ')

export async function getLabels(supabase: SupabaseServerClient): Promise<Label[]> {
  const { data, error } = await supabase.from('labels').select(LABEL_SELECT).order('name')

  throwIfError(error, 'get labels')

  return parse(array(LabelSchema), data)
}

export async function createLabel(
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

export async function updateLabel(
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
