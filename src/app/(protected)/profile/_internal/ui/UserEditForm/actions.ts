import { updateCurrentUserProfileAction } from '@/adapters/inbound/next/server-actions/users'
import type { UpdateUser } from '@/domain/user/user'

export function updateCurrentUserProfile(userId: string, input: UpdateUser) {
  return updateCurrentUserProfileAction(userId, input)
}
