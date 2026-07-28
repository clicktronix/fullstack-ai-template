import 'server-only'

import { parse } from 'valibot'
import { createHttpError } from '@/shared/kernel/errors/api-error'
import { throwIfError } from '@/shared/server/supabase/throw-supabase-error'
import type { SupabaseServerClient } from '@/shared/server/supabase/types'
import { UserSchema, type UpdateUser, type User } from '../domain/user'

const USER_SELECT = 'id, email, role, full_name, created_at, updated_at'

export async function getProfileFromStore(
  supabase: SupabaseServerClient,
  userId: string
): Promise<User> {
  const { data, error } = await supabase.from('users').select(USER_SELECT).eq('id', userId).single()

  if (error?.code === 'PGRST116' || (!error && !data)) {
    throw createHttpError(500, 'Authenticated user profile is missing')
  }
  throwIfError(error, 'get authenticated user profile')
  return parse(UserSchema, data)
}

export async function updateProfileInStore(
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
    .select(USER_SELECT)
    .single()

  throwIfError(error, 'update user profile')

  return parse(UserSchema, data)
}
