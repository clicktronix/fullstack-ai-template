import { connection } from 'next/server'
import { Suspense } from 'react'
import { WorkItemDetailModal } from './_internal/ui/WorkItemDetailModal'

export default async function WorkItemDetailModalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await connection()
  const { id } = await params

  return (
    <Suspense fallback={null}>
      <WorkItemDetailModal id={id} />
    </Suspense>
  )
}
