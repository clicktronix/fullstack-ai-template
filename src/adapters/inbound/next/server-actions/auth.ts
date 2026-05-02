'use server'

import type { Session } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { parse } from 'valibot'
import { createClient } from '@/adapters/supabase/server'
import {
  LoginCredentialsSchema,
  OAuthProviderSchema,
  SignUpInputSchema,
  type LoginCredentials,
  type OAuthProvider,
  type SignUpInput,
} from '@/domain/auth/auth'
import { UserSchema, type User } from '@/domain/user/user'
import {
  actionClient,
  unwrapSafeActionResult,
  unwrapVoidSafeActionResult,
} from '@/infrastructure/actions/safe-action'
import { verifySession } from '@/infrastructure/auth/verify-session'
import { UnauthorizedError, createHttpError } from '@/lib/errors/api-error'

type OAuthRedirectResult = {
  url: string | null
}

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

    const { data, error } = await supabase.auth.signInWithPassword(parsedInput)

    if (error) {
      throw new UnauthorizedError(`Sign in failed: ${error.message}`)
    }

    if (!data.session) {
      throw new UnauthorizedError('Sign in failed: No session returned')
    }

    return data.session
  })

const safeSignUpAction = actionClient
  .inputSchema(SignUpInputSchema)
  .action(async ({ parsedInput }): Promise<Session | null> => {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email: parsedInput.email,
      password: parsedInput.password,
      options: {
        data: {
          full_name: parsedInput.fullName,
        },
      },
    })

    if (error) {
      throw createHttpError(400, `Sign up failed: ${error.message}`)
    }

    return data.session
  })

const safeSignOutAction = actionClient.action(async (): Promise<void> => {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw createHttpError(500, `Sign out failed: ${error.message}`)
  }
})

const safeSignInWithOAuthAction = actionClient
  .inputSchema(OAuthProviderSchema)
  .action(async ({ parsedInput }): Promise<OAuthRedirectResult> => {
    const supabase = await createClient()
    const origin = getOrigin(await headers())

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: parsedInput,
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) throw error

    return { url: data.url }
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

export async function getSessionAction(): Promise<Session | null> {
  const supabase = await createClient()

  // Supabase SSR guidance: server-side code must verify the cookie session with
  // getUser() before exposing session data. getSession() alone only reads cookies.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new UnauthorizedError(`Failed to get session: ${error.message}`)
  }

  return data.session
}

export async function getCurrentUserAction(): Promise<User | null> {
  const session = await verifySession()
  if (!session) return null
  return parse(UserSchema, session.user)
}
