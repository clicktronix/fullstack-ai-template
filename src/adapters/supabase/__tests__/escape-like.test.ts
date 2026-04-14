import { describe, expect, test } from 'bun:test'
import { escapeLikePattern } from '../escape-like'

describe('escapeLikePattern', () => {
  test('normal string passes through unchanged', () => {
    expect(escapeLikePattern('hello world')).toBe('hello world')
  })

  test('escapes % wildcard', () => {
    expect(escapeLikePattern('100%')).toBe(String.raw`100\%`)
  })

  test('escapes _ single char wildcard', () => {
    expect(escapeLikePattern('user_name')).toBe(String.raw`user\_name`)
  })

  test('escapes backslash', () => {
    expect(escapeLikePattern(String.raw`path\to`)).toBe(String.raw`path\\to`)
  })

  test('escapes combined special characters', () => {
    expect(escapeLikePattern(String.raw`100%_test\value`)).toBe(String.raw`100\%\_test\\value`)
  })

  test('empty string returns empty', () => {
    expect(escapeLikePattern('')).toBe('')
  })
})
