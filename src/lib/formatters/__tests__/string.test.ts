import { describe, expect, test } from 'bun:test'
import { formatToolName } from '../string'

describe('formatToolName', () => {
  describe('snake_case conversion', () => {
    test('converts snake_case to title case with spaces', () => {
      expect(formatToolName('get_user_info')).toBe('Get user info')
    })

    test('handles multiple underscores', () => {
      expect(formatToolName('fetch_all_user_data')).toBe('Fetch all user data')
    })

    test('handles single word with no underscores', () => {
      expect(formatToolName('search')).toBe('Search')
    })
  })

  describe('camelCase conversion', () => {
    test('converts camelCase to title case with spaces', () => {
      // Note: consecutive uppercase letters are split individually
      expect(formatToolName('fetchDataFromAPI')).toBe('Fetch data from a p i')
    })

    test('handles consecutive uppercase letters (splits each)', () => {
      expect(formatToolName('getHTTPResponse')).toBe('Get h t t p response')
    })

    test('handles PascalCase', () => {
      expect(formatToolName('GetUserProfile')).toBe('Get user profile')
    })
  })

  describe('mixed formats', () => {
    test('handles mixed snake_case and camelCase', () => {
      expect(formatToolName('get_userData')).toBe('Get user data')
    })

    test('handles underscores with camelCase', () => {
      expect(formatToolName('fetch_userProfile_data')).toBe('Fetch user profile data')
    })
  })

  describe('edge cases', () => {
    test('handles empty string', () => {
      expect(formatToolName('')).toBe('')
    })

    test('handles single character', () => {
      expect(formatToolName('a')).toBe('A')
    })

    test('handles single uppercase character', () => {
      expect(formatToolName('A')).toBe('A')
    })

    test('handles only underscores', () => {
      expect(formatToolName('___')).toBe('')
    })

    test('handles leading underscore', () => {
      expect(formatToolName('_private_method')).toBe('Private method')
    })

    test('handles trailing underscore', () => {
      expect(formatToolName('method_')).toBe('Method')
    })

    test('handles already formatted string', () => {
      expect(formatToolName('already formatted')).toBe('Already formatted')
    })

    test('preserves numbers', () => {
      expect(formatToolName('get_user_v2')).toBe('Get user v2')
    })

    test('handles numbers in camelCase', () => {
      expect(formatToolName('getUser2Info')).toBe('Get user2 info')
    })
  })
})
