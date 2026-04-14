import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { createActionError } from '@/lib/errors/action-error'
import { AUTHENTICATION_ERROR } from '@/lib/errors/codes'

type SupabaseServerClient = SupabaseClient

export async function getAuthenticatedUserId(
  supabase: SupabaseServerClient
): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) return null
  return user?.id ?? null
}

export async function requireAuthenticatedUserId(supabase: SupabaseServerClient): Promise<string> {
  const userId = await getAuthenticatedUserId(supabase)
  if (!userId) {
    throw createActionError(AUTHENTICATION_ERROR, 'requireAuthenticatedUserId')
  }
  return userId
}
