'use client'

import type { UseQueryOptions } from '@tanstack/react-query'
import { array, object, parse } from 'valibot'
import { useAuthenticatedQuery } from '@/modules/identity/client'
import { createHttpError } from '@/shared/kernel/errors/api-error'
import { GC_TIME, STALE_TIME } from '@/shared/ui/query/constants'
import { LabelSchema, type Label } from '../../domain/label'
import { labelKeys } from '../../query-cache'

const LabelsEnvelopeSchema = object({
  data: array(LabelSchema),
})

async function fetchLabels(): Promise<Label[]> {
  const response = await fetch('/api/labels', {
    method: 'GET',
    cache: 'no-store',
  })
  if (!response.ok) {
    throw createHttpError(response.status, `Request failed: ${response.statusText}`)
  }
  return parse(LabelsEnvelopeSchema, await response.json()).data
}

function getLabelsQueryOptions() {
  return {
    queryKey: labelKeys.list(),
    queryFn: fetchLabels,
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
