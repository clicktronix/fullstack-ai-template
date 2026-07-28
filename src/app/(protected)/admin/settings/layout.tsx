import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense, type ReactNode } from 'react'
import { isOwner, readCurrentUser } from '@/modules/identity/rsc'
import { ApiErrorBoundary } from '@/shared/ui/components/ApiErrorBoundary'
import ProtectedLoading from '../../loading'

/**
 * Settings layout with owner role check.
 *
 * Settings pages are only accessible to users with 'owner' role.
 * Other users are redirected to the work-items page.
 *
 * Note: readCurrentUser() is called here and in the parent protected layout,
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
  const user = await readCurrentUser()

  if (!user || !isOwner(user)) {
    redirect('/admin/work-items')
  }

  return <ApiErrorBoundary>{children}</ApiErrorBoundary>
}
