import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import type { Metadata } from 'next'
import { getQueryClient } from '@/lib/query-client'
import { prefetchLabels } from '@/ui/server-state/labels/prefetch'
import { prefetchWorkItems } from '@/ui/server-state/work-items/prefetch'
import { WorkItemsDashboard } from './_internal/ui/WorkItemsDashboard'

export const metadata: Metadata = {
  title: 'Work Items',
}

export default async function WorkItemsPage() {
  const queryClient = getQueryClient()

  await Promise.all([
    prefetchWorkItems(queryClient, { status: 'active', page: 1, pageSize: 20 }),
    prefetchLabels(queryClient),
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkItemsDashboard status="active" />
    </HydrationBoundary>
  )
}
