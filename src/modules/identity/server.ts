import 'server-only'

import type { Session } from '@supabase/supabase-js'
import { createActionError } from '@/shared/kernel/errors/action-error'
import { UnauthorizedError, createHttpError } from '@/shared/kernel/errors/api-error'
import { AUTHORIZATION_ERROR } from '@/shared/kernel/errors/codes'
import { getAuthenticatedUserId } from '@/shared/server/auth/authenticated-user'
import type { SupabaseServerClient } from '@/shared/server/supabase/types'
import type { LoginCredentials, OAuthProvider, SignUpInput } from './domain/auth'
import {
  UpdateUserSchema,
  UserRoleSchema,
  type UpdateUser,
  type User,
  type UserRole,
} from './domain/user'
import { getProfileFromStore, updateProfileInStore } from './server/profile-store'

export type IdentityContext = {
  actorId: string
  role: UserRole
}

export type IdentityEffects = {
  supabase: SupabaseServerClient
}

type IdentityAuthClient = Pick<
  SupabaseServerClient['auth'],
  'signInWithPassword' | 'signInWithOAuth' | 'signOut' | 'signUp'
>

export type IdentityAuthEffects = {
  auth: IdentityAuthClient
}

export async function signIn(
  effects: IdentityAuthEffects,
  input: LoginCredentials
): Promise<Session> {
  const { data, error } = await effects.auth.signInWithPassword(input)
  if (error || !data.session) {
    throw new UnauthorizedError(`Sign in failed: ${error?.message ?? 'No session returned'}`)
  }
  return data.session
}

export async function signUp(
  effects: IdentityAuthEffects,
  input: SignUpInput
): Promise<Session | null> {
  const { data, error } = await effects.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { full_name: input.fullName } },
  })
  if (error) throw createHttpError(400, `Sign up failed: ${error.message}`)
  return data.session
}

export async function signOut(effects: IdentityAuthEffects): Promise<void> {
  const { error } = await effects.auth.signOut()
  if (error) throw createHttpError(500, `Sign out failed: ${error.message}`)
}

export async function startOAuthSignIn(
  effects: IdentityAuthEffects,
  provider: OAuthProvider,
  redirectTo: string
): Promise<{ url: string | null }> {
  const { data, error } = await effects.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  })
  if (error) throw error
  return { url: data.url }
}

export async function readCurrentUser(effects: IdentityEffects): Promise<User | null> {
  const userId = await getAuthenticatedUserId(effects.supabase)
  if (!userId) return null
  return getProfileFromStore(effects.supabase, userId)
}

export async function readIdentityContext(
  effects: IdentityEffects,
  userId: string
): Promise<IdentityContext> {
  const user = await getProfileFromStore(effects.supabase, userId)
  return { actorId: user.id, role: user.role }
}

export function updateCurrentUserProfile(
  identity: Pick<IdentityContext, 'actorId'>,
  effects: IdentityEffects,
  userId: string,
  input: UpdateUser
): Promise<User> {
  if (identity.actorId !== userId) {
    throw createActionError(AUTHORIZATION_ERROR, 'identity: user can only update self')
  }
  return updateProfileInStore(effects.supabase, identity.actorId, input)
}

export { UpdateUserSchema, UserRoleSchema, type UpdateUser, type User, type UserRole }
export type { LoginCredentials, OAuthProvider, SignUpInput }
export {
  DEFAULT_AUTHENTICATED_ROUTE,
  getPostLoginRedirect,
  isAuthRoute,
  isProtectedRoute,
} from './domain/routes'
