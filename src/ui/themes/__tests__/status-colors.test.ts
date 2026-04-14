import { describe, expect, test } from 'bun:test'
import { ITEM_STATUS_COLORS, USER_ROLE_COLORS, getStatusColor } from '../status-colors'

describe('getStatusColor', () => {
  test('null returns "dark"', () => {
    expect(getStatusColor(ITEM_STATUS_COLORS, null)).toBe('dark')
  })

  test('undefined returns "dark"', () => {
    expect(getStatusColor(ITEM_STATUS_COLORS, undefined)).toBe('dark')
  })

  test('empty string returns "dark"', () => {
    expect(getStatusColor(ITEM_STATUS_COLORS, '')).toBe('dark')
  })

  test('valid status "active" returns "green"', () => {
    expect(getStatusColor(ITEM_STATUS_COLORS, 'active')).toBe('green')
  })

  test('valid status "archived" returns "red"', () => {
    expect(getStatusColor(ITEM_STATUS_COLORS, 'archived')).toBe('red')
  })

  test('valid user role "owner" returns "dark"', () => {
    expect(getStatusColor(USER_ROLE_COLORS, 'owner')).toBe('dark')
  })

  test('valid user role "admin" returns "sky"', () => {
    expect(getStatusColor(USER_ROLE_COLORS, 'admin')).toBe('sky')
  })

  test('unknown status returns "dark"', () => {
    expect(getStatusColor(ITEM_STATUS_COLORS, 'unknown_status')).toBe('dark')
  })
})
