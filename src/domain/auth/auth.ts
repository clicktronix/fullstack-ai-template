import {
  type InferOutput,
  email,
  minLength,
  object,
  optional,
  parse,
  picklist,
  pipe,
  string,
} from 'valibot'

export const OAuthProviderSchema = picklist(['google'])
export type OAuthProvider = InferOutput<typeof OAuthProviderSchema>

/**
 * Schema for login form validation.
 * Email must be valid, password must be at least 8 characters.
 */
export const LoginCredentialsSchema = object({
  email: pipe(string(), email('Invalid email address')),
  password: pipe(string(), minLength(8, 'Password must be at least 8 characters')),
})
export type LoginCredentials = InferOutput<typeof LoginCredentialsSchema>

export const AuthErrorSchema = object({
  error: string(),
  error_description: optional(string()),
})
export type AuthError = InferOutput<typeof AuthErrorSchema>

export function parseAuthError(hash: string): AuthError | null {
  if (!hash || !hash.startsWith('#')) {
    return null
  }

  const params = new URLSearchParams(hash.slice(1))
  const error = params.get('error')

  if (!error) {
    return null
  }

  try {
    return parse(AuthErrorSchema, {
      error,
      error_description: params.get('error_description') || undefined,
    })
  } catch {
    return null
  }
}
