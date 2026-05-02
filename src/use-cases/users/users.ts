import { parse } from 'valibot'
import { UpdateUserSchema, type UpdateUser, type User } from '@/domain/user/user'
import type { UsersRepository } from './ports'

type UsersDeps = {
  users: UsersRepository
}

export async function updateUserProfile(
  deps: UsersDeps,
  userId: string,
  input: UpdateUser
): Promise<User> {
  const validated = parse(UpdateUserSchema, input)
  return deps.users.updateProfile(userId, validated)
}
