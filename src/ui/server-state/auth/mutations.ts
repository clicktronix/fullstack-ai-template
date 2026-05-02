import type { Session } from '@supabase/supabase-js'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  signInAction,
  signInWithOAuthAction,
  signOutAction,
  signUpAction,
} from '@/adapters/inbound/next/server-actions/auth'
import type { OAuthProvider } from '@/domain/auth/auth'
import { authKeys } from '@/ui/server-state/auth/keys'

/**
 * Input type for sign in mutation.
 */
export type SignInInput = {
  email: string
  password: string
}

/**
 * Input type for sign up mutation.
 */
export type SignUpInput = {
  email: string
  password: string
  fullName?: string
}

/**
 * Mutation hook for signing in with email and password.
 *
 * On success:
 * - Updates session cache
 * - Invalidates user query to refetch user data
 *
 * Note: Redirect should be handled in UI layer via onSuccess callback.
 */
export function useSignIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SignInInput): Promise<Session> => signInAction(input),
    onSuccess: (session) => {
      // Update session in cache
      queryClient.setQueryData(authKeys.session(), session)
      // Invalidate user query to refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.user() })
    },
  })
}

/**
 * Mutation hook for signing up with email and password.
 *
 * On success:
 * - If session returned (no email confirmation), updates cache
 * - If no session (email confirmation required), UI should handle this case
 *
 * Note: Redirect should be handled in UI layer via onSuccess callback.
 */
export function useSignUp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SignUpInput): Promise<Session | null> => signUpAction(input),
    onSuccess: (session) => {
      if (session) {
        // Email confirmation not required, user is logged in
        queryClient.setQueryData(authKeys.session(), session)
        queryClient.invalidateQueries({ queryKey: authKeys.user() })
      }
      // If session is null, email confirmation is required
      // UI should handle this case
    },
  })
}

/**
 * Mutation hook for signing out.
 *
 * On success/error:
 * - Clears all cached data (important for security)
 *
 * Note: Redirect should be handled in UI layer via onSuccess/onSettled callback.
 */
export function useSignOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => signOutAction(),
    onSettled: () => {
      // Clear all cached data regardless of success or failure
      queryClient.clear()
    },
  })
}

/**
 * OAuth sign-in mutation.
 * Initiates redirect to provider's consent screen.
 * No onSuccess needed — browser navigates away during OAuth flow.
 */
export function useOAuthSignIn() {
  return useMutation({
    mutationFn: async (provider: OAuthProvider) => {
      const result = await signInWithOAuthAction(provider)
      if (result.url) {
        globalThis.location.href = result.url
      }
      return result
    },
  })
}
