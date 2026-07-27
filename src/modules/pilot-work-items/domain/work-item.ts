import {
  boolean,
  type InferOutput,
  minLength,
  nullable,
  object,
  optional,
  pipe,
  string,
  trim,
} from 'valibot'

export const PilotWorkItemSchema = object({
  id: string(),
  title: pipe(string(), trim(), minLength(1)),
  description: nullable(string()),
  priority: boolean(),
})

export const CreatePilotWorkItemSchema = object({
  title: pipe(string(), trim(), minLength(1)),
  description: optional(nullable(string())),
  priority: optional(boolean()),
})

export type PilotWorkItem = InferOutput<typeof PilotWorkItemSchema>
export type CreatePilotWorkItem = InferOutput<typeof CreatePilotWorkItemSchema>
