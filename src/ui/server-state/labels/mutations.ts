'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createLabelAction, updateLabelAction } from '@/adapters/inbound/next/server-actions/labels'
import type { CreateLabel, Label, UpdateLabel } from '@/domain/label/label'
import { labelKeys } from './keys'

export function useCreateLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateLabel): Promise<Label> => createLabelAction(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: labelKeys.lists() })
    },
  })
}

export function useUpdateLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLabel }): Promise<Label> =>
      updateLabelAction(id, input),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: labelKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: labelKeys.detail(variables.id) }),
      ])
    },
  })
}
