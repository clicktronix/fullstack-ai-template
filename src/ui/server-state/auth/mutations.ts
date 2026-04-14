import type { Session } from '@supabase/supabase-js'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { signIn, signInWithOAuth, signOut, signUp } from '@/adapters/outbound/api/auth'
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
    mutationFn: ({ email, password }: SignInInput): Promise<Session> => signIn(email, password),
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
    mutationFn: ({ email, password, fullName }: SignUpInput): Promise<Session | null> =>
      signUp(email, password, fullName),
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
    mutationFn: () => signOut(),
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
    mutationFn: (provider: OAuthProvider) => signInWithOAuth(provider),
  })
}

/**
 * Response type for link telegram mutation.
 */
export type LinkTelegramResponse = {
  deep_link: string
}

/**
 * Mutation hook for linking Telegram account.
 * Backend API endpoint for telegram linking is not implemented yet.
 *
 * @returns Mutation with deep_link to open Telegram bot
 */
export function useLinkTelegram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<LinkTelegramResponse> => {
      // Replace with actual API call when backend endpoint is ready.
      // return authApi.linkTelegram()
      throw new Error('Telegram linking not implemented yet')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() })
    },
  })
}

/**
 * Mutation hook for unlinking Telegram account.
 * Backend API endpoint for telegram unlinking is not implemented yet.
 */
export function useUnlinkTelegram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<void> => {
      // Replace with actual API call when backend endpoint is ready.
      // return authApi.unlinkTelegram()
      throw new Error('Telegram unlinking not implemented yet')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() })
    },
  })
}
