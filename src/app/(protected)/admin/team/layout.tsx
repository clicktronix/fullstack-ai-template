import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense, type ReactNode } from 'react'
import { isOwner, readCurrentUser } from '@/modules/identity/rsc'
import { ApiErrorBoundary } from '@/shared/ui/components/ApiErrorBoundary'
import ProtectedLoading from '../../loading'

/**
 * Team layout with owner role check.
 *
 * Team management pages are only accessible to users with 'owner' role.
 * Other users are redirected to the work-items page.
 *
 * Note: readCurrentUser() is called here and in the parent protected layout,
 * but React cache() deduplicates the calls within the same request.
 */
export default function TeamLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ProtectedLoading />}>
      <TeamGate>{children}</TeamGate>
    </Suspense>
  )
}

async function TeamGate({ children }: { children: ReactNode }) {
  await connection()
  const user = await readCurrentUser()

  if (!user || !isOwner(user)) {
    redirect('/admin/work-items')
  }

  return <ApiErrorBoundary>{children}</ApiErrorBoundary>
}
