/**
 * Validates a code field value.
 *
 * Requirements:
 * - Must not be empty
 * - Must contain only lowercase letters, numbers, underscores, and hyphens
 *
 * @param value - The code value to validate
 * @param requiredMessage - Error message when value is empty
 * @param formatMessage - Error message when format is invalid
 * @returns Error message string or null if valid
 */
export function validateCode(
  value: string,
  requiredMessage: string,
  formatMessage: string
): string | null {
  if (value.trim().length === 0) return requiredMessage
  if (!/^[a-z0-9_-]+$/.test(value)) return formatMessage
  return null
}
