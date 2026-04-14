import 'server-only'

import { parse } from 'valibot'
import { throwIfError } from '@/adapters/supabase/throw-supabase-error'
import type { SupabaseServerClient } from '@/adapters/supabase/types'
import { UserSchema, type UpdateUser, type User } from '@/domain/user/user'

/**
 * Update current user's profile fields.
 */
export async function updateUserProfile(
  supabase: SupabaseServerClient,
  userId: string,
  input: UpdateUser
): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update({
      full_name: input.full_name,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('id, email, role, full_name, created_at, updated_at')
    .single()

  throwIfError(error, 'update user profile')

  return parse(UserSchema, data)
}
