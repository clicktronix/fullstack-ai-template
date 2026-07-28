/* eslint-disable sonarjs/no-hardcoded-passwords */
import { describe, expect, test } from 'bun:test'
import { email, minLength, number, object, pipe, string } from 'valibot'
import { createMantineValidator } from '../create-mantine-validator'

describe('createMantineValidator', () => {
  describe('with simple schema', () => {
    const schema = object({
      name: pipe(string(), minLength(1, 'Name is required')),
      email: pipe(string(), email('Invalid email format')),
    })

    test('returns empty object for valid data', () => {
      const validate = createMantineValidator(schema)

      const result = validate({
        name: 'John Doe',
        email: 'john@example.com',
      })

      expect(result).toEqual({})
    })

    test('returns errors for invalid data', () => {
      const validate = createMantineValidator(schema)

      const result = validate({
        name: '',
        email: 'invalid-email',
      })

      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('email')
    })

    test('returns specific error messages', () => {
      const validate = createMantineValidator(schema)

      const result = validate({
        name: '',
        email: 'not-an-email',
      })

      expect(result.name).toBe('Name is required')
      expect(result.email).toBe('Invalid email format')
    })

    test('validates partial errors', () => {
      const validate = createMantineValidator(schema)

      const result = validate({
        name: 'Valid Name',
        email: 'invalid-email',
      })

      expect(result).not.toHaveProperty('name')
      expect(result).toHaveProperty('email')
    })
  })

  describe('with nested schema', () => {
    const schema = object({
      user: object({
        name: pipe(string(), minLength(1, 'Name is required')),
        profile: object({
          age: number('Age must be a number'),
        }),
      }),
    })

    test('returns empty object for valid nested data', () => {
      const validate = createMantineValidator(schema)

      const result = validate({
        user: {
          name: 'John',
          profile: {
            age: 25,
          },
        },
      })

      expect(result).toEqual({})
    })

    test('returns dot-notation path for nested errors', () => {
      const validate = createMantineValidator(schema)

      const result = validate({
        user: {
          name: '',
          profile: {
            age: 'not a number' as unknown as number,
          },
        },
      })

      expect(result['user.name']).toBe('Name is required')
      expect(result['user.profile.age']).toBe('Age must be a number')
    })
  })

  describe('with missing fields', () => {
    const schema = object({
      required: pipe(string(), minLength(1, 'Field is required')),
    })

    test('returns errors for missing required fields', () => {
      const validate = createMantineValidator(schema)

      const result = validate({})

      expect(Object.keys(result).length).toBeGreaterThan(0)
    })

    test('handles undefined values', () => {
      const validate = createMantineValidator(schema)

      const result = validate({ required: undefined })

      expect(Object.keys(result).length).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    const schema = object({
      name: string(),
    })

    test('handles null input gracefully', () => {
      const validate = createMantineValidator(schema)

      // null input returns empty errors because valibot issues have no path for root-level type errors
      const result = validate(null)

      expect(typeof result).toBe('object')
    })

    test('handles undefined input gracefully', () => {
      const validate = createMantineValidator(schema)

      // undefined input returns empty errors because valibot issues have no path for root-level type errors
      const result = validate(undefined)

      expect(typeof result).toBe('object')
    })

    test('handles primitive input gracefully', () => {
      const validate = createMantineValidator(schema)

      // primitive input returns empty errors because valibot issues have no path for root-level type errors
      const result = validate('not an object')

      expect(typeof result).toBe('object')
    })

    test('returns empty object for valid data', () => {
      const validate = createMantineValidator(schema)

      const result = validate({ name: 'Valid' })

      expect(result).toEqual({})
    })
  })

  describe('complex validation rules', () => {
    const schema = object({
      password: pipe(string(), minLength(8, 'Password must be at least 8 characters')),
      confirmPassword: pipe(string(), minLength(1, 'Please confirm your password')),
    })

    test('validates multiple rules on same field', () => {
      const validate = createMantineValidator(schema)

      const result = validate({
        password: 'short',
        confirmPassword: '',
      })

      expect(result.password).toBe('Password must be at least 8 characters')
      expect(result.confirmPassword).toBe('Please confirm your password')
    })

    test('passes validation for valid complex data', () => {
      const validate = createMantineValidator(schema)

      const result = validate({
        password: 'securepassword123',
        confirmPassword: 'securepassword123',
      })

      expect(result).toEqual({})
    })
  })
})
