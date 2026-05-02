import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense, type ReactNode } from 'react'
import { isOwner } from '@/domain/user/user'
import { verifySession } from '@/infrastructure/auth/verify-session'
import { ApiErrorBoundary } from '@/ui/components/ApiErrorBoundary'
import ProtectedLoading from '../../loading'

/**
 * Team layout with owner role check.
 *
 * Team management pages are only accessible to users with 'owner' role.
 * Other users are redirected to the work-items page.
 *
 * Note: verifySession() is called here and in the parent (protected) layout,
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
  const session = await verifySession()

  // Parent layout handles null session redirect, but check anyway for type safety
  if (!session || !isOwner(session.user)) {
    redirect('/admin/work-items')
  }

  return <ApiErrorBoundary>{children}</ApiErrorBoundary>
}
