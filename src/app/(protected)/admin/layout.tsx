import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense, type ReactNode } from 'react'
import { hasAccess, readCurrentUser } from '@/modules/identity/rsc'
import ProtectedLoading from '../loading'

/**
 * Admin layout with role check.
 *
 * Admin pages are only accessible to users with 'owner' or 'admin' role.
 * Pending users are redirected to the home page.
 *
 * Note: readCurrentUser() is called here and in the parent protected layout,
 * but React cache() deduplicates the calls within the same request.
 */
export default function AdminLayout({
  children,
  modal,
}: {
  children: ReactNode
  modal: ReactNode
}) {
  return (
    <Suspense fallback={<ProtectedLoading />}>
      <AdminGate>
        {children}
        {modal}
      </AdminGate>
    </Suspense>
  )
}

async function AdminGate({ children }: { children: ReactNode }) {
  await connection()
  const user = await readCurrentUser()

  if (!user || !hasAccess(user)) {
    redirect('/')
  }

  return children
}
