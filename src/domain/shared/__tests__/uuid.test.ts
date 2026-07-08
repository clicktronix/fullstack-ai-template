import { describe, expect, it } from 'bun:test'
import { isValidUuid, UUID_REGEX } from '../uuid'

describe('UUID utilities', () => {
  describe('isValidUuid', () => {
    it('returns true for valid UUID v4', () => {
      expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
      expect(isValidUuid('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true)
      expect(isValidUuid('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true)
    })

    it('returns true for valid UUID with uppercase letters', () => {
      expect(isValidUuid('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
      expect(isValidUuid('F47AC10B-58CC-4372-A567-0E02B2C3D479')).toBe(true)
    })

    it('returns false for invalid UUID formats', () => {
      expect(isValidUuid('not-a-uuid')).toBe(false)
      expect(isValidUuid('550e8400')).toBe(false)
      expect(isValidUuid('550e8400-e29b-41d4-a716')).toBe(false)
      expect(isValidUuid('550e8400-e29b-41d4-a716-44665544000')).toBe(false) // too short
      expect(isValidUuid('550e8400-e29b-41d4-a716-4466554400000')).toBe(false) // too long
      expect(isValidUuid('')).toBe(false)
      expect(isValidUuid('invalid-format-uuid-string-here')).toBe(false)
    })

    it('returns false for UUID with invalid characters', () => {
      expect(isValidUuid('550e8400-e29b-41d4-a716-44665544000g')).toBe(false) // 'g' is not hex
      expect(isValidUuid('550e8400-e29b-41d4-a716-44665544000z')).toBe(false) // 'z' is not hex
    })
  })

  describe('UUID_REGEX', () => {
    it('matches valid UUIDs', () => {
      expect(UUID_REGEX.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    })

    it('does not match invalid UUIDs', () => {
      expect(UUID_REGEX.test('not-a-uuid')).toBe(false)
    })
  })
})
