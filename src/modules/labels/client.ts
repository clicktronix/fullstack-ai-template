'use client'

export { useCreateLabel, useUpdateLabel } from './client/query/mutations'
export { useLabels } from './client/query/queries'
export { labelKeys } from './cache'
export type { CreateLabel, Label, UpdateLabel } from './domain/label'
