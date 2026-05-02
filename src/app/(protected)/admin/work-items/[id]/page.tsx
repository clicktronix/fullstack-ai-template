import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'
import ProtectedLoading from '../../../loading'
import { WorkItemDetailPanel } from './_internal/ui/WorkItemDetailPanel'

export const metadata: Metadata = {
  title: 'Work Item',
}

export default async function WorkItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connection()
  const { id } = await params

  return (
    <Suspense fallback={<ProtectedLoading />}>
      <WorkItemDetailPanel id={id} variant="page" />
    </Suspense>
  )
}
