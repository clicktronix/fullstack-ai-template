'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  archiveWorkItemAction,
  createWorkItemAction,
  restoreWorkItemAction,
  updateWorkItemAction,
} from '@/adapters/inbound/next/server-actions/work-items'
import type { CreateWorkItem, UpdateWorkItem, WorkItem } from '@/domain/work-item/work-item'
import { workItemKeys } from './keys'

export function useCreateWorkItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateWorkItem): Promise<WorkItem> => createWorkItemAction(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: workItemKeys.lists() })
    },
  })
}

export function useUpdateWorkItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWorkItem }): Promise<WorkItem> =>
      updateWorkItemAction(id, input),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workItemKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: workItemKeys.detail(variables.id) }),
      ])
    },
  })
}

export function useArchiveWorkItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string): Promise<WorkItem> => archiveWorkItemAction(id),
    onSuccess: async (_data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workItemKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: workItemKeys.detail(id) }),
      ])
    },
  })
}

export function useRestoreWorkItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string): Promise<WorkItem> => restoreWorkItemAction(id),
    onSuccess: async (_data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workItemKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: workItemKeys.detail(id) }),
      ])
    },
  })
}
