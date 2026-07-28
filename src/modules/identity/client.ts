'use client'

export { useOAuthSignIn, useSignIn, useSignOut, useSignUp } from './client/query/mutations'
export { useAuthenticatedQuery } from './client/query/authenticated-query'
export { authKeys } from './query-cache'
export { useCurrentUser, useSession } from './client/query/queries'
export { onAuthStateChange, type AuthStateChangeCallback } from './client/auth-events'
export {
  getUserDisplayName,
  getUserInitials,
  hasAccess,
  isAdmin,
  isOwner,
  type UpdateUser,
  type User,
  type UserRole,
} from './domain/user'
export type { LoginCredentials, OAuthProvider, SignUpInput } from './domain/auth'
export { LoginCredentialsSchema, OAuthProviderSchema, SignUpInputSchema } from './domain/auth'
export { getPostLoginRedirect, isAuthRoute } from './domain/routes'
