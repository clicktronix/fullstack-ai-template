import {
  array,
  boolean,
  isoTimestamp,
  nullable,
  object,
  optional,
  pipe,
  string,
  trim,
  minLength,
  picklist,
  type InferOutput,
} from 'valibot'

export const WorkItemStatusSchema = picklist(['active', 'archived'])

export const WorkItemSchema = object({
  id: string(),
  title: pipe(string(), trim(), minLength(1)),
  description: nullable(string()),
  status: WorkItemStatusSchema,
  is_priority: boolean(),
  label_ids: array(string()),
  created_at: pipe(string(), isoTimestamp()),
  updated_at: pipe(string(), isoTimestamp()),
})

export const CreateWorkItemSchema = object({
  title: pipe(string(), trim(), minLength(1)),
  description: optional(nullable(string())),
  is_priority: optional(boolean()),
  label_ids: optional(array(string())),
})

export const UpdateWorkItemSchema = object({
  title: optional(pipe(string(), trim(), minLength(1))),
  description: optional(nullable(string())),
  is_priority: optional(boolean()),
  label_ids: optional(array(string())),
})

export type WorkItem = InferOutput<typeof WorkItemSchema>
export type WorkItemStatus = InferOutput<typeof WorkItemStatusSchema>
export type CreateWorkItem = InferOutput<typeof CreateWorkItemSchema>
export type UpdateWorkItem = InferOutput<typeof UpdateWorkItemSchema>
