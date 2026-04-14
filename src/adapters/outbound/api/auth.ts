/**
 * Auth Adapter for Supabase Authentication.
 *
 * Provides authentication operations:
 * - signIn: Email/password login
 * - signUp: Registration (creates user in auth.users, triggers creates public.users)
 * - signOut: Logout
 * - getSession: Get current session
 * - getCurrentUser: Get user from public.users table
 * - onAuthStateChange: Subscribe to auth state changes
 */

import type { AuthChangeEvent, OAuthResponse, Session, Subscription } from '@supabase/supabase-js'
import { parse } from 'valibot'
import { supabase } from '@/adapters/supabase/client'
import type { OAuthProvider } from '@/domain/auth/auth'
import { UserSchema, type User } from '@/domain/user/user'
import { UnauthorizedError, createHttpError } from '@/lib/errors/api-error'

/**
 * Sign in with email and password.
 *
 * @param email - User email
 * @param password - User password
 * @returns Session with user data
 * @throws Error if authentication fails
 */
export async function signIn(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new UnauthorizedError(`Sign in failed: ${error.message}`)
  }

  if (!data.session) {
    throw new UnauthorizedError('Sign in failed: No session returned')
  }

  return data.session
}

/**
 * Sign up with email and password.
 * Creates a new user in auth.users.
 * A trigger automatically creates a corresponding record in public.users.
 *
 * @param email - User email
 * @param password - User password
 * @param fullName - Optional full name
 * @returns Session with user data (may be null if email confirmation required)
 * @throws Error if registration fails
 */
export async function signUp(
  email: string,
  password: string,
  fullName?: string
): Promise<Session | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    throw createHttpError(400, `Sign up failed: ${error.message}`)
  }

  // Session may be null if email confirmation is required
  return data.session
}

/**
 * Sign out the current user.
 *
 * @throws Error if sign out fails
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw createHttpError(500, `Sign out failed: ${error.message}`)
  }
}

/**
 * Initiate OAuth sign-in flow.
 * Redirects browser to provider's consent screen.
 * After consent, provider redirects to /auth/callback which exchanges code for session.
 *
 * @param provider - OAuth provider (e.g. 'google')
 * @returns OAuthResponse with redirect URL
 * @throws Error if OAuth initiation fails
 */
export async function signInWithOAuth(provider: OAuthProvider): Promise<OAuthResponse> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${globalThis.location.origin}/auth/callback`,
    },
  })

  if (error) throw error

  if (data.url) {
    globalThis.location.href = data.url
  }

  return { data, error }
}

/**
 * Get the current session.
 *
 * @returns Current session or null if not authenticated
 * @throws Error if session retrieval fails
 */
export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new UnauthorizedError(`Failed to get session: ${error.message}`)
  }

  return data.session
}

/**
 * Get the current user from public.users table.
 * This returns the application user data, not the auth.users data.
 *
 * @returns User from public.users or null if not authenticated
 * @throws Error if user retrieval fails
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

  if (sessionError) {
    throw new UnauthorizedError(`Failed to get session: ${sessionError.message}`)
  }

  if (!sessionData.session) {
    return null
  }

  const userId = sessionData.session.user.id

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, role, full_name, created_at, updated_at')
    .eq('id', userId)
    .single()

  if (userError) {
    throw createHttpError(404, `Failed to get user: ${userError.message}`)
  }

  return parse(UserSchema, user)
}

/**
 * Callback type for auth state changes.
 */
export type AuthStateChangeCallback = (event: AuthChangeEvent, session: Session | null) => void

/**
 * Subscribe to authentication state changes.
 *
 * @param callback - Function called when auth state changes
 * @returns Subscription object with unsubscribe method
 */
export function onAuthStateChange(callback: AuthStateChangeCallback): Subscription {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback)

  return subscription
}
