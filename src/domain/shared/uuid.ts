/**
 * UUID validation utilities.
 */

/**
 * UUID v4 regex pattern.
 */
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Check if a string is a valid UUID v4.
 */
export function isValidUuid(id: string): boolean {
  return UUID_REGEX.test(id)
}
