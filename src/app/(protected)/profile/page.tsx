import type { Metadata } from 'next'
import { ProfileView } from './_internal/ui/ProfileView'

export const metadata: Metadata = {
  title: 'Profile | Platform',
}

/**
 * Profile page.
 * Authentication is handled by (protected) layout.
 */
export default function ProfilePage() {
  return <ProfileView />
}
