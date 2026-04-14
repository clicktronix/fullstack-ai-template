import { describe, expect, test } from 'bun:test'
import { authKeys } from '@/ui/server-state/auth/keys'

describe('authKeys', () => {
  test('all returns base auth key array', () => {
    expect(authKeys.all).toEqual(['auth'])
  })

  test('session returns nested session key', () => {
    expect(authKeys.session()).toEqual(['auth', 'session'])
  })

  test('user returns nested user key', () => {
    expect(authKeys.user()).toEqual(['auth', 'user'])
  })

  test('keys are readonly arrays', () => {
    const all = authKeys.all
    const session = authKeys.session()
    const user = authKeys.user()

    expect(Array.isArray(all)).toBe(true)
    expect(Array.isArray(session)).toBe(true)
    expect(Array.isArray(user)).toBe(true)
  })

  test('session key includes all key', () => {
    const session = authKeys.session()
    expect(session[0]).toBe('auth')
  })

  test('user key includes all key', () => {
    const user = authKeys.user()
    expect(user[0]).toBe('auth')
  })

  test('session and user keys are different', () => {
    const session = authKeys.session()
    const user = authKeys.user()

    expect(session).not.toEqual(user)
    expect(session[1]).toBe('session')
    expect(user[1]).toBe('user')
  })

  test('factory functions return new arrays each time', () => {
    const session1 = authKeys.session()
    const session2 = authKeys.session()
    const user1 = authKeys.user()
    const user2 = authKeys.user()

    // Equal in value
    expect(session1).toEqual(session2)
    expect(user1).toEqual(user2)

    // But new array instances
    expect(session1).not.toBe(session2)
    expect(user1).not.toBe(user2)
  })
})
