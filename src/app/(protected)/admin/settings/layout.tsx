import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense, type ReactNode } from 'react'
import { isOwner } from '@/domain/user/user'
import { verifySession } from '@/infrastructure/auth/verify-session'
import { ApiErrorBoundary } from '@/ui/components/ApiErrorBoundary'
import ProtectedLoading from '../../loading'

/**
 * Settings layout with owner role check.
 *
 * Settings pages are only accessible to users with 'owner' role.
 * Other users are redirected to the work-items page.
 *
 * Note: verifySession() is called here and in the parent (protected) layout,
 * but React cache() deduplicates the calls within the same request.
 */
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ProtectedLoading />}>
      <SettingsGate>{children}</SettingsGate>
    </Suspense>
  )
}

async function SettingsGate({ children }: { children: ReactNode }) {
  await connection()
  const session = await verifySession()

  // Parent layout handles null session redirect, but check anyway for type safety
  if (!session || !isOwner(session.user)) {
    redirect('/admin/work-items')
  }

  return <ApiErrorBoundary>{children}</ApiErrorBoundary>
}
