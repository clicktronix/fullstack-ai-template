/**
 * User domain for the starter template.
 *
 * Represents team members who can access the application:
 * - owner: Full access, can manage team and template settings
 * - admin: Can manage product data and internal operations
 * - pending: Waiting for approval
 */

import {
  type InferOutput,
  email,
  isoTimestamp,
  maxLength,
  minLength,
  nullable,
  object,
  optional,
  picklist,
  pipe,
  string,
  uuid,
} from 'valibot'

// ===== User Role Schema =====

export const UserRoleSchema = picklist(['owner', 'admin', 'pending'])

export type UserRole = InferOutput<typeof UserRoleSchema>

// ===== User Schema =====

export const UserSchema = object({
  id: pipe(string(), uuid()),
  email: pipe(string(), email()),
  role: UserRoleSchema,
  full_name: nullable(string()),
  created_at: nullable(pipe(string(), isoTimestamp())),
  updated_at: nullable(pipe(string(), isoTimestamp())),
})

export type User = InferOutput<typeof UserSchema>

export const UpdateUserSchema = object({
  full_name: optional(pipe(string(), minLength(1), maxLength(100))),
})

export type UpdateUser = InferOutput<typeof UpdateUserSchema>

// ===== Utility Functions =====

const WHITESPACE_RE = /\s+/

/**
 * Returns the display name for a user.
 * Uses full_name if available, otherwise falls back to email.
 */
export function getUserDisplayName(user: User): string {
  return user.full_name ?? user.email
}

/**
 * Returns the initials for a user avatar.
 * Extracts initials from full_name or first letter of email.
 */
export function getUserInitials(user: User): string {
  if (user.full_name) {
    const parts = user.full_name.trim().split(WHITESPACE_RE)
    if (parts.length >= 2) {
      const lastPart = parts.at(-1)
      return `${parts[0].charAt(0)}${lastPart?.charAt(0) ?? ''}`.toUpperCase()
    }
    return parts[0].charAt(0).toUpperCase()
  }
  return user.email.charAt(0).toUpperCase()
}

/**
 * Checks if the user has owner role.
 */
export function isOwner(user: User): boolean {
  return user.role === 'owner'
}

/**
 * Checks if the user has admin role.
 */
export function isAdmin(user: User): boolean {
  return user.role === 'admin'
}

/**
 * Checks if the user has access to protected pages (owner or admin).
 */
export function hasAccess(user: User): boolean {
  return user.role === 'owner' || user.role === 'admin'
}
