import 'server-only'

import { parse } from 'valibot'
import { throwIfError } from '@/adapters/supabase/throw-supabase-error'
import type { SupabaseServerClient } from '@/adapters/supabase/types'
import { UserSchema } from '@/domain/user/user'
import type { UsersRepository } from '@/use-cases/users/ports'

export function createSupabaseUsersRepository(supabase: SupabaseServerClient): UsersRepository {
  return {
    async updateProfile(userId, input) {
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
    },
  }
}
