'use server'

import { updateCurrentUserProfileAction } from '@/modules/identity/actions'
import type { UpdateUser } from '@/modules/identity/client'

export async function updateCurrentUserProfile(userId: string, input: UpdateUser) {
  return updateCurrentUserProfileAction(userId, input)
}
