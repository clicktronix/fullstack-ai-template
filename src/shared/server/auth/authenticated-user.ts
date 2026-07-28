import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { createActionError } from '@/shared/kernel/errors/action-error'
import { AUTHENTICATION_ERROR } from '@/shared/kernel/errors/codes'

type SupabaseServerClient = SupabaseClient

const ANONYMOUS_AUTH_ERROR_CODES = new Set([
  'bad_jwt',
  'no_authorization',
  'refresh_token_already_used',
  'refresh_token_not_found',
  'session_expired',
  'session_not_found',
])

function isAnonymousSessionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const authError = error as { code?: unknown; name?: unknown }
  return (
    authError.name === 'AuthSessionMissingError' ||
    (typeof authError.code === 'string' && ANONYMOUS_AUTH_ERROR_CODES.has(authError.code))
  )
}

export async function getAuthenticatedUserId(
  supabase: SupabaseServerClient
): Promise<string | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) {
    if (isAnonymousSessionError(error)) return null
    throw error
  }
  return user?.id ?? null
}

export async function requireAuthenticatedUserId(supabase: SupabaseServerClient): Promise<string> {
  const userId = await getAuthenticatedUserId(supabase)
  if (!userId) {
    throw createActionError(AUTHENTICATION_ERROR, 'requireAuthenticatedUserId')
  }
  return userId
}
