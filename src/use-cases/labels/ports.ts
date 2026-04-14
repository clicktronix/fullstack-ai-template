import type { CreateLabel, Label, UpdateLabel } from '@/domain/label/label'

export type LabelsRepository = {
  list: () => Promise<Label[]>
  create: (input: CreateLabel) => Promise<Label>
  update: (id: string, input: UpdateLabel) => Promise<Label>
}
