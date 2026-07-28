'use server'

import type { Session } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { object, pipe, string, uuid } from 'valibot'
import {
  actionClient,
  authActionClient,
  unwrapSafeActionResult,
  unwrapVoidSafeActionResult,
} from '@/shared/server/actions/safe-action'
import { createClient } from '@/shared/server/supabase/server'
import {
  LoginCredentialsSchema,
  OAuthProviderSchema,
  SignUpInputSchema,
  type LoginCredentials,
  type OAuthProvider,
  type SignUpInput,
} from './domain/auth'
import {
  signIn,
  signOut,
  signUp,
  startOAuthSignIn,
  updateCurrentUserProfile,
  UpdateUserSchema,
  type UpdateUser,
  type User,
} from './server'

type OAuthRedirectResult = {
  url: string | null
}

type UpdateProfileResult = {
  success: true
  data: User
}

const UpdateCurrentUserProfileInputSchema = object({
  userId: pipe(string(), uuid()),
  input: UpdateUserSchema,
})

function getOrigin(headersList: Headers): string {
  const forwardedProto = headersList.get('x-forwarded-proto') ?? 'http'
  const forwardedHost = headersList.get('x-forwarded-host')
  const host = forwardedHost ?? headersList.get('host') ?? 'localhost:3000'
  return `${forwardedProto}://${host}`
}

const safeSignInAction = actionClient
  .inputSchema(LoginCredentialsSchema)
  .action(async ({ parsedInput }): Promise<Session> => {
    const supabase = await createClient()
    return signIn({ auth: supabase.auth }, parsedInput)
  })

const safeSignUpAction = actionClient
  .inputSchema(SignUpInputSchema)
  .action(async ({ parsedInput }): Promise<Session | null> => {
    const supabase = await createClient()
    return signUp({ auth: supabase.auth }, parsedInput)
  })

const safeSignOutAction = actionClient.action(async (): Promise<void> => {
  const supabase = await createClient()
  return signOut({ auth: supabase.auth })
})

const safeSignInWithOAuthAction = actionClient
  .inputSchema(OAuthProviderSchema)
  .action(async ({ parsedInput }): Promise<OAuthRedirectResult> => {
    const supabase = await createClient()
    const origin = getOrigin(await headers())
    return startOAuthSignIn({ auth: supabase.auth }, parsedInput, `${origin}/auth/callback`)
  })

const safeUpdateCurrentUserProfileAction = authActionClient
  .inputSchema(UpdateCurrentUserProfileInputSchema)
  .action(async ({ ctx, parsedInput }): Promise<UpdateProfileResult> => {
    const user = await updateCurrentUserProfile(
      { actorId: ctx.userId },
      { supabase: ctx.supabase },
      parsedInput.userId,
      parsedInput.input
    )
    return { success: true, data: user }
  })

export async function signInAction(input: LoginCredentials): Promise<Session> {
  return unwrapSafeActionResult(await safeSignInAction(input))
}

export async function signUpAction(input: SignUpInput): Promise<Session | null> {
  return unwrapSafeActionResult(await safeSignUpAction(input))
}

export async function signOutAction(): Promise<void> {
  unwrapVoidSafeActionResult(await safeSignOutAction())
}

export async function signInWithOAuthAction(provider: OAuthProvider): Promise<OAuthRedirectResult> {
  return unwrapSafeActionResult(await safeSignInWithOAuthAction(provider))
}

export async function updateCurrentUserProfileAction(
  userId: string,
  input: UpdateUser
): Promise<UpdateProfileResult> {
  return unwrapSafeActionResult(await safeUpdateCurrentUserProfileAction({ userId, input }))
}
