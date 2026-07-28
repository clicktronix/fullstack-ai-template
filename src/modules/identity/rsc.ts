import 'server-only'

import { cache } from 'react'
import { createClient } from '@/shared/server/supabase/server'
import { readCurrentUser as readCurrentUserFromServer } from './server'

export const readCurrentUser = cache(async () =>
  readCurrentUserFromServer({ supabase: await createClient() })
)

export {
  getUserDisplayName,
  getUserInitials,
  hasAccess,
  isAdmin,
  isOwner,
  type User,
  type UserRole,
} from './domain/user'
