'use client'

import type { UseQueryOptions } from '@tanstack/react-query'
import { getLabelsAction } from '@/adapters/inbound/next/server-actions/labels'
import type { Label } from '@/domain/label/label'
import { useAuthenticatedQuery } from '@/ui/server-state/auth/authenticated-query'
import { GC_TIME, STALE_TIME } from '@/ui/server-state/constants'
import { labelKeys } from './keys'

export function getLabelsQueryOptions() {
  return {
    queryKey: labelKeys.list(),
    queryFn: () => getLabelsAction(),
    staleTime: STALE_TIME.REFERENCE_DATA,
    gcTime: GC_TIME.REFERENCE_DATA,
  } as const
}

export function useLabels(options?: Omit<UseQueryOptions<Label[]>, 'queryKey' | 'queryFn'>) {
  return useAuthenticatedQuery({
    ...getLabelsQueryOptions(),
    ...options,
  })
}
