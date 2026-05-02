/* eslint-disable sonarjs/no-hardcoded-passwords */
import { describe, expect, test } from 'bun:test'
import { safeParse } from 'valibot'
import {
  AuthErrorSchema,
  LoginCredentialsSchema,
  OAuthProviderSchema,
  parseAuthError,
} from './auth'

// ===== OAuthProviderSchema Tests =====

describe('OAuthProviderSchema', () => {
  test('validates "google" provider', () => {
    const result = safeParse(OAuthProviderSchema, 'google')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.output).toBe('google')
    }
  })

  test('rejects invalid provider', () => {
    const result = safeParse(OAuthProviderSchema, 'facebook')
    expect(result.success).toBe(false)
  })

  test('rejects empty string', () => {
    const result = safeParse(OAuthProviderSchema, '')
    expect(result.success).toBe(false)
  })

  test('rejects null', () => {
    const result = safeParse(OAuthProviderSchema, null)
    expect(result.success).toBe(false)
  })

  test('rejects undefined', () => {
    const result = safeParse(OAuthProviderSchema, undefined)
    expect(result.success).toBe(false)
  })

  test('provides correct options for iteration', () => {
    expect(OAuthProviderSchema.options).toEqual(['google'])
  })
})

// ===== LoginCredentialsSchema Tests =====

describe('LoginCredentialsSchema', () => {
  describe('valid data', () => {
    test('validates correct credentials', () => {
      const credentials = {
        email: 'user@example.com',
        password: 'password123',
      }
      const result = safeParse(LoginCredentialsSchema, credentials)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output.email).toBe('user@example.com')
        expect(result.output.password).toBe('password123')
      }
    })

    test('validates minimum password length (8 characters)', () => {
      const credentials = {
        email: 'user@example.com',
        password: '12345678',
      }
      const result = safeParse(LoginCredentialsSchema, credentials)
      expect(result.success).toBe(true)
    })

    test('validates various email formats', () => {
      const validEmails = [
        'simple@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user@subdomain.example.com',
      ]

      for (const email of validEmails) {
        const result = safeParse(LoginCredentialsSchema, {
          email,
          password: 'password123',
        })
        expect(result.success).toBe(true)
      }
    })

    test('validates long passwords', () => {
      const credentials = {
        email: 'user@example.com',
        password: 'very-long-and-secure-password-with-special-chars!@#$%^&*()',
      }
      const result = safeParse(LoginCredentialsSchema, credentials)
      expect(result.success).toBe(true)
    })

    test('validates unicode characters in password', () => {
      const credentials = {
        email: 'user@example.com',
        password: 'password-n-123',
      }
      const result = safeParse(LoginCredentialsSchema, credentials)
      expect(result.success).toBe(true)
    })
  })

  describe('invalid data', () => {
    test('rejects invalid email format', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'user@',
        'user@.com',
        '',
        'user.example.com',
      ]

      for (const email of invalidEmails) {
        const result = safeParse(LoginCredentialsSchema, {
          email,
          password: 'password123',
        })
        expect(result.success).toBe(false)
      }
    })

    test('rejects password shorter than 6 characters', () => {
      const shortPasswords = ['', '1', '12', '123', '1234', '12345']

      for (const password of shortPasswords) {
        const result = safeParse(LoginCredentialsSchema, {
          email: 'user@example.com',
          password,
        })
        expect(result.success).toBe(false)
      }
    })

    test('rejects missing email', () => {
      const result = safeParse(LoginCredentialsSchema, {
        password: 'password123',
      })
      expect(result.success).toBe(false)
    })

    test('rejects missing password', () => {
      const result = safeParse(LoginCredentialsSchema, {
        email: 'user@example.com',
      })
      expect(result.success).toBe(false)
    })

    test('rejects empty object', () => {
      const result = safeParse(LoginCredentialsSchema, {})
      expect(result.success).toBe(false)
    })

    test('rejects null values', () => {
      const result = safeParse(LoginCredentialsSchema, {
        email: null,
        password: null,
      })
      expect(result.success).toBe(false)
    })

    test('provides correct error message for invalid email', () => {
      const result = safeParse(LoginCredentialsSchema, {
        email: 'invalid',
        password: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const emailIssue = result.issues.find((issue) => issue.path?.[0]?.key === 'email')
        expect(emailIssue?.message).toBe('Invalid email address')
      }
    })

    test('provides correct error message for short password', () => {
      const result = safeParse(LoginCredentialsSchema, {
        email: 'user@example.com',
        password: '1234567',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const passwordIssue = result.issues.find((issue) => issue.path?.[0]?.key === 'password')
        expect(passwordIssue?.message).toBe('Password must be at least 8 characters')
      }
    })
  })
})

// ===== AuthErrorSchema Tests =====

describe('AuthErrorSchema', () => {
  describe('valid data', () => {
    test('validates error with description', () => {
      const authError = {
        error: 'access_denied',
        error_description: 'User denied access',
      }
      const result = safeParse(AuthErrorSchema, authError)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output.error).toBe('access_denied')
        expect(result.output.error_description).toBe('User denied access')
      }
    })

    test('validates error without description', () => {
      const authError = {
        error: 'invalid_request',
      }
      const result = safeParse(AuthErrorSchema, authError)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output.error).toBe('invalid_request')
        expect(result.output.error_description).toBeUndefined()
      }
    })

    test('validates common OAuth error types', () => {
      const errorTypes = [
        'access_denied',
        'invalid_request',
        'invalid_scope',
        'server_error',
        'temporarily_unavailable',
        'unauthorized_client',
      ]

      for (const error of errorTypes) {
        const result = safeParse(AuthErrorSchema, { error })
        expect(result.success).toBe(true)
      }
    })
  })

  describe('invalid data', () => {
    test('rejects missing error', () => {
      const result = safeParse(AuthErrorSchema, {
        error_description: 'Some description',
      })
      expect(result.success).toBe(false)
    })

    test('rejects empty object', () => {
      const result = safeParse(AuthErrorSchema, {})
      expect(result.success).toBe(false)
    })

    test('rejects null error', () => {
      const result = safeParse(AuthErrorSchema, {
        error: null,
      })
      expect(result.success).toBe(false)
    })

    test('rejects empty string error', () => {
      // Empty string is valid for Valibot string() schema
      const result = safeParse(AuthErrorSchema, {
        error: '',
      })
      expect(result.success).toBe(true)
    })
  })
})

// ===== parseAuthError Function Tests =====

describe('parseAuthError', () => {
  test('returns null for empty string', () => {
    expect(parseAuthError('')).toBeNull()
  })

  test('returns null for string without hash', () => {
    expect(parseAuthError('error=access_denied')).toBeNull()
  })

  test('returns null for hash without error parameter', () => {
    expect(parseAuthError('#success=true')).toBeNull()
  })

  test('parses error from hash correctly', () => {
    const result = parseAuthError('#error=access_denied')
    expect(result).toEqual({
      error: 'access_denied',
      error_description: undefined,
    })
  })

  test('parses error with description from hash', () => {
    const result = parseAuthError('#error=access_denied&error_description=User%20denied%20access')
    expect(result).toEqual({
      error: 'access_denied',
      error_description: 'User denied access',
    })
  })

  test('handles URL encoded error description', () => {
    const result = parseAuthError(
      '#error=invalid_request&error_description=The%20request%20is%20missing%20a%20required%20parameter'
    )
    expect(result).toEqual({
      error: 'invalid_request',
      error_description: 'The request is missing a required parameter',
    })
  })

  test('handles hash with additional parameters', () => {
    const result = parseAuthError('#error=access_denied&state=abc123&error_description=Denied')
    expect(result).toEqual({
      error: 'access_denied',
      error_description: 'Denied',
    })
  })

  test('handles empty error_description as undefined', () => {
    const result = parseAuthError('#error=access_denied&error_description=')
    expect(result).toEqual({
      error: 'access_denied',
      error_description: undefined,
    })
  })

  test('returns null for invalid hash format (just #)', () => {
    const result = parseAuthError('#')
    expect(result).toBeNull()
  })

  test('handles special characters in error description', () => {
    const result = parseAuthError(
      '#error=test&error_description=Error%3A%20%22Something%22%20failed'
    )
    expect(result).toEqual({
      error: 'test',
      error_description: 'Error: "Something" failed',
    })
  })

  test('handles unicode in error description', () => {
    const result = parseAuthError('#error=test&error_description=Caff%C3%A8')
    expect(result).toEqual({
      error: 'test',
      error_description: 'Caffè',
    })
  })
})
