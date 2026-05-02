import type { UpdateUser, User } from '@/domain/user/user'

export type UsersRepository = {
  updateProfile: (userId: string, input: UpdateUser) => Promise<User>
}
