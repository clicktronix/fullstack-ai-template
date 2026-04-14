import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { hasAccess } from '@/domain/user/user'
import { verifySession } from '@/infrastructure/auth/verify-session'

/**
 * Admin layout with role check.
 *
 * Admin pages are only accessible to users with 'owner' or 'admin' role.
 * Pending users are redirected to the home page.
 *
 * Note: verifySession() is called here and in the parent (protected) layout,
 * but React cache() deduplicates the calls within the same request.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await verifySession()

  // Parent layout handles null session redirect, but check anyway for type safety
  if (!session || !hasAccess(session.user)) {
    redirect('/')
  }

  return children
}
