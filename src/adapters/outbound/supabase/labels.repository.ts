import type { SupabaseServerClient } from '@/adapters/supabase/types'
import type { LabelsRepository } from '@/use-cases/labels/ports'
import { createLabel, getLabels, updateLabel } from './labels.operations'

export function createSupabaseLabelsRepository(supabase: SupabaseServerClient): LabelsRepository {
  return {
    list: () => getLabels(supabase),
    create: (input) => createLabel(supabase, input),
    update: (id, input) => updateLabel(supabase, id, input),
  }
}
