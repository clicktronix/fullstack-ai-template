import { describe, expect, test } from 'bun:test'
import { emptyStringToUndefined } from '../empty-string'

describe('emptyStringToUndefined', () => {
  test('converts an empty string to undefined', () => {
    expect(emptyStringToUndefined('')).toBeUndefined()
  })

  test('leaves undefined as undefined', () => {
    expect(emptyStringToUndefined(undefined)).toBeUndefined()
  })

  test('leaves a non-empty string unchanged', () => {
    expect(emptyStringToUndefined('value')).toBe('value')
  })
})
