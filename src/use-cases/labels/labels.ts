import { parse } from 'valibot'
import {
  CreateLabelSchema,
  UpdateLabelSchema,
  type CreateLabel,
  type Label,
  type UpdateLabel,
} from '@/domain/label/label'
import type { LabelsRepository } from './ports'

type LabelsDeps = {
  labels: LabelsRepository
}

export async function listLabels(deps: LabelsDeps): Promise<Label[]> {
  return deps.labels.list()
}

export async function createLabel(deps: LabelsDeps, input: CreateLabel): Promise<Label> {
  const validated = parse(CreateLabelSchema, input)
  return deps.labels.create(validated)
}

export async function updateLabel(
  deps: LabelsDeps,
  id: string,
  input: UpdateLabel
): Promise<Label> {
  const validated = parse(UpdateLabelSchema, input)
  return deps.labels.update(id, validated)
}
