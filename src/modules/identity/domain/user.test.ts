import { describe, expect, test } from 'bun:test'
import { safeParse } from 'valibot'
import {
  type User,
  UserRoleSchema,
  UserSchema,
  getUserDisplayName,
  hasAccess,
  isAdmin,
  isOwner,
} from './user'

// ===== Test Fixtures =====

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: 'admin',
    full_name: null,
    created_at: '2024-01-15T10:30:00.000Z',
    updated_at: '2024-01-15T10:30:00.000Z',
    ...overrides,
  }
}

// ===== UserRoleSchema Tests =====

describe('UserRoleSchema', () => {
  test('validates "owner" role', () => {
    const result = safeParse(UserRoleSchema, 'owner')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.output).toBe('owner')
    }
  })

  test('validates "admin" role', () => {
    const result = safeParse(UserRoleSchema, 'admin')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.output).toBe('admin')
    }
  })

  test('validates "pending" role', () => {
    const result = safeParse(UserRoleSchema, 'pending')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.output).toBe('pending')
    }
  })

  test('rejects invalid role', () => {
    const result = safeParse(UserRoleSchema, 'superadmin')
    expect(result.success).toBe(false)
  })

  test('rejects empty string', () => {
    const result = safeParse(UserRoleSchema, '')
    expect(result.success).toBe(false)
  })

  test('rejects null', () => {
    const result = safeParse(UserRoleSchema, null)
    expect(result.success).toBe(false)
  })

  test('rejects undefined', () => {
    const result = safeParse(UserRoleSchema, undefined)
    expect(result.success).toBe(false)
  })

  test('rejects number', () => {
    const result = safeParse(UserRoleSchema, 1)
    expect(result.success).toBe(false)
  })

  test('provides correct options for iteration', () => {
    expect(UserRoleSchema.options).toEqual(['owner', 'admin', 'pending'])
  })
})

// ===== UserSchema Tests =====

describe('UserSchema', () => {
  describe('valid data', () => {
    test('validates complete user with full_name', () => {
      const userData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        role: 'owner' as const,
        full_name: 'John Doe',
        created_at: '2024-01-15T10:30:00.000Z',
        updated_at: '2024-01-15T10:30:00.000Z',
      }
      const result = safeParse(UserSchema, userData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output).toEqual(userData)
      }
    })

    test('validates user with null full_name', () => {
      const userData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        role: 'admin',
        full_name: null,
        created_at: '2024-01-15T10:30:00.000Z',
        updated_at: '2024-01-15T10:30:00.000Z',
      }
      const result = safeParse(UserSchema, userData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.output.full_name).toBeNull()
      }
    })

    test('validates user with pending role', () => {
      const userData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'pending@example.com',
        role: 'pending',
        full_name: 'Pending User',
        created_at: '2024-01-15T10:30:00.000Z',
        updated_at: '2024-01-15T10:30:00.000Z',
      }
      const result = safeParse(UserSchema, userData)
      expect(result.success).toBe(true)
    })

    test('validates different UUID formats', () => {
      const validUUIDs = [
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      ]

      for (const uuid of validUUIDs) {
        const result = safeParse(UserSchema, {
          ...createUser(),
          id: uuid,
        })
        expect(result.success).toBe(true)
      }
    })

    test('validates various email formats', () => {
      const validEmails = [
        'simple@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user@subdomain.example.com',
      ]

      for (const email of validEmails) {
        const result = safeParse(UserSchema, {
          ...createUser(),
          email,
        })
        expect(result.success).toBe(true)
      }
    })
  })

  describe('invalid data', () => {
    test('rejects invalid UUID format', () => {
      const result = safeParse(UserSchema, {
        ...createUser(),
        id: 'not-a-uuid',
      })
      expect(result.success).toBe(false)
    })

    test('rejects empty id', () => {
      const result = safeParse(UserSchema, {
        ...createUser(),
        id: '',
      })
      expect(result.success).toBe(false)
    })

    test('rejects invalid email format', () => {
      const invalidEmails = ['not-an-email', '@example.com', 'user@', 'user@.com', '']

      for (const email of invalidEmails) {
        const result = safeParse(UserSchema, {
          ...createUser(),
          email,
        })
        expect(result.success).toBe(false)
      }
    })

    test('rejects missing email', () => {
      const user = createUser()
      const { email, ...userWithoutEmail } = user
      expect(email).toBeDefined() // Use the variable to satisfy linter
      const result = safeParse(UserSchema, userWithoutEmail)
      expect(result.success).toBe(false)
    })

    test('rejects invalid role', () => {
      const result = safeParse(UserSchema, {
        ...createUser(),
        role: 'invalid_role',
      })
      expect(result.success).toBe(false)
    })

    test('rejects invalid timestamp format for created_at', () => {
      const result = safeParse(UserSchema, {
        ...createUser(),
        created_at: '2024-01-15',
      })
      expect(result.success).toBe(false)
    })

    test('rejects invalid timestamp format for updated_at', () => {
      const result = safeParse(UserSchema, {
        ...createUser(),
        updated_at: 'not-a-timestamp',
      })
      expect(result.success).toBe(false)
    })

    test('rejects missing required fields', () => {
      const result = safeParse(UserSchema, {})
      expect(result.success).toBe(false)
    })

    test('rejects null for required fields', () => {
      const result = safeParse(UserSchema, {
        ...createUser(),
        email: null,
      })
      expect(result.success).toBe(false)
    })

    test('rejects undefined full_name (should be null)', () => {
      const user = createUser()
      const { full_name, ...userWithoutFullName } = user
      expect(full_name).toBeNull() // Use the variable to satisfy linter
      const result = safeParse(UserSchema, userWithoutFullName)
      expect(result.success).toBe(false)
    })
  })
})

// ===== Utility Functions Tests =====

describe('getUserDisplayName', () => {
  test('returns full_name when available', () => {
    const user = createUser({ full_name: 'John Doe' })
    expect(getUserDisplayName(user)).toBe('John Doe')
  })

  test('returns email when full_name is null', () => {
    const user = createUser({ full_name: null, email: 'user@example.com' })
    expect(getUserDisplayName(user)).toBe('user@example.com')
  })

  test('handles unicode characters in full_name', () => {
    const user = createUser({ full_name: 'Ivan Perez' })
    expect(getUserDisplayName(user)).toBe('Ivan Perez')
  })

  test('handles empty string full_name (returns it, not email)', () => {
    const user = createUser({ full_name: '' })
    // Empty string is falsy but not null, so ?? returns it
    expect(getUserDisplayName(user)).toBe('')
  })
})

describe('isOwner', () => {
  test('returns true for owner role', () => {
    const user = createUser({ role: 'owner' })
    expect(isOwner(user)).toBe(true)
  })

  test('returns false for admin role', () => {
    const user = createUser({ role: 'admin' })
    expect(isOwner(user)).toBe(false)
  })

  test('returns false for pending role', () => {
    const user = createUser({ role: 'pending' })
    expect(isOwner(user)).toBe(false)
  })
})

describe('isAdmin', () => {
  test('returns true for admin role', () => {
    const user = createUser({ role: 'admin' })
    expect(isAdmin(user)).toBe(true)
  })

  test('returns false for owner role', () => {
    const user = createUser({ role: 'owner' })
    expect(isAdmin(user)).toBe(false)
  })

  test('returns false for pending role', () => {
    const user = createUser({ role: 'pending' })
    expect(isAdmin(user)).toBe(false)
  })
})

describe('hasAccess', () => {
  test('returns true for owner role', () => {
    const user = createUser({ role: 'owner' })
    expect(hasAccess(user)).toBe(true)
  })

  test('returns true for admin role', () => {
    const user = createUser({ role: 'admin' })
    expect(hasAccess(user)).toBe(true)
  })

  test('returns false for pending role', () => {
    const user = createUser({ role: 'pending' })
    expect(hasAccess(user)).toBe(false)
  })
})
