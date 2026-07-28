import 'server-only'

import { createActionError } from '@/shared/kernel/errors/action-error'
import { AUTHORIZATION_ERROR } from '@/shared/kernel/errors/codes'
import type { SupabaseServerClient } from '@/shared/server/supabase/types'
import {
  CreateLabelSchema,
  LabelSchema,
  UpdateLabelSchema,
  type CreateLabel,
  type Label,
  type UpdateLabel,
} from './domain/label'
import { createLabelInStore, listLabelsFromStore, updateLabelInStore } from './server/store'

export type LabelsIdentity = {
  actorId: string
  role: string
}

export type LabelsEffects = {
  supabase: SupabaseServerClient
}

function assertCanManageLabels(identity: LabelsIdentity): void {
  if (identity.role !== 'owner' && identity.role !== 'admin') {
    throw createActionError(AUTHORIZATION_ERROR, 'labels: insufficient role')
  }
}

export function listLabels(identity: LabelsIdentity, effects: LabelsEffects): Promise<Label[]> {
  assertCanManageLabels(identity)
  return listLabelsFromStore(effects.supabase)
}

export function createLabel(
  identity: LabelsIdentity,
  effects: LabelsEffects,
  input: CreateLabel
): Promise<Label> {
  assertCanManageLabels(identity)
  return createLabelInStore(effects.supabase, input)
}

export function updateLabel(
  identity: LabelsIdentity,
  effects: LabelsEffects,
  id: string,
  input: UpdateLabel
): Promise<Label> {
  assertCanManageLabels(identity)
  return updateLabelInStore(effects.supabase, id, input)
}

export {
  CreateLabelSchema,
  LabelSchema,
  UpdateLabelSchema,
  type CreateLabel,
  type Label,
  type UpdateLabel,
}
