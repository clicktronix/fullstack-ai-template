import {
  isoTimestamp,
  nullable,
  object,
  optional,
  pipe,
  string,
  trim,
  minLength,
  type InferOutput,
} from 'valibot'

export const LabelSchema = object({
  id: string(),
  name: pipe(string(), trim(), minLength(1)),
  color: nullable(string()),
  created_at: pipe(string(), isoTimestamp()),
})

export const CreateLabelSchema = object({
  name: pipe(string(), trim(), minLength(1)),
  color: optional(nullable(string())),
})

export const UpdateLabelSchema = object({
  name: optional(pipe(string(), trim(), minLength(1))),
  color: optional(nullable(string())),
})

export type Label = InferOutput<typeof LabelSchema>
export type CreateLabel = InferOutput<typeof CreateLabelSchema>
export type UpdateLabel = InferOutput<typeof UpdateLabelSchema>
