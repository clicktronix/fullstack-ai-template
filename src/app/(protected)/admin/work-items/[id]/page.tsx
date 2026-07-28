import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { prefetchWorkItem } from '@/modules/work-items/rsc'
import { getQueryClient } from '@/shared/ui/providers/query-client'
import ProtectedLoading from '../../../loading'
import { WorkItemDetailPanel } from './_internal/ui/WorkItemDetailPanel'

export const metadata: Metadata = {
  title: 'Work Item',
}

export default async function WorkItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connection()
  const { id } = await params
  const queryClient = getQueryClient()
  await prefetchWorkItem(queryClient, id)

  return (
    <Suspense fallback={<ProtectedLoading />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <WorkItemDetailPanel id={id} variant="page" />
      </HydrationBoundary>
    </Suspense>
  )
}
