/// <reference lib="dom" />

/**
 * Tests for Supabase mock utilities
 *
 * Verifies that the Supabase mocks work correctly for testing
 * database operations, authentication, and storage.
 */

import { describe, expect, test, beforeEach } from 'bun:test'
import {
  createMockSupabaseClient,
  mockSupabaseResponse,
  createMockError,
  createMockUser,
  createMockSession,
  setupMockAuth,
  clearMockAuth,
} from '../mocks/supabase'

describe('Supabase Mock Utilities', () => {
  describe('createMockSupabaseClient', () => {
    test('creates a mock client with all methods', () => {
      const client = createMockSupabaseClient()

      expect(client.from).toBeDefined()
      expect(client.rpc).toBeDefined()
      expect(client.auth).toBeDefined()
      expect(client.storage).toBeDefined()
    })

    test('from() returns chainable query builder', () => {
      const client = createMockSupabaseClient()
      const query = client.from('users')

      expect(query.select).toBeDefined()
      expect(query.insert).toBeDefined()
      expect(query.update).toBeDefined()
      expect(query.delete).toBeDefined()
      expect(query.eq).toBeDefined()
      expect(query.single).toBeDefined()
    })

    test('query methods are chainable', () => {
      const client = createMockSupabaseClient()

      // This should not throw
      const query = client.from('users').select('*').eq('id', '1').order('created_at').limit(10)

      expect(query).toBeDefined()
    })
  })

  describe('mockSupabaseResponse', () => {
    test('sets response for queries', async () => {
      const client = createMockSupabaseClient()
      const mockData = [{ id: '1', name: 'Test User' }]

      mockSupabaseResponse(client, { data: mockData, error: null })

      const result = await client.from('users').select('*')
      expect(result.data).toEqual(mockData)
      expect(result.error).toBeNull()
    })

    test('sets error response', async () => {
      const client = createMockSupabaseClient()
      const mockError = createMockError('Not found', 'PGRST116')

      mockSupabaseResponse(client, { data: null, error: mockError })

      const result = await client.from('users').select('*').single()
      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('Not found')
      expect(result.error?.code).toBe('PGRST116')
    })
  })

  describe('createMockError', () => {
    test('creates error with all fields', () => {
      const error = createMockError('Database error', 'DB001', 'Check constraints')

      expect(error.message).toBe('Database error')
      expect(error.code).toBe('DB001')
      expect(error.details).toBe('Check constraints')
    })

    test('creates error with message only', () => {
      const error = createMockError('Simple error')

      expect(error.message).toBe('Simple error')
      expect(error.code).toBeUndefined()
    })
  })

  describe('createMockUser', () => {
    test('creates user with default values', () => {
      const user = createMockUser()

      expect(user.id).toBe('test-user-id')
      expect(user.email).toBe('test@example.com')
      expect(user.email_confirmed_at).toBeDefined()
      expect(user.created_at).toBeDefined()
    })

    test('creates user with overrides', () => {
      const user = createMockUser({
        id: 'custom-id',
        email: 'custom@example.com',
        user_metadata: { name: 'Custom User' },
      })

      expect(user.id).toBe('custom-id')
      expect(user.email).toBe('custom@example.com')
      expect(user.user_metadata).toEqual({ name: 'Custom User' })
    })
  })

  describe('createMockSession', () => {
    test('creates session with tokens', () => {
      const session = createMockSession()

      expect(session.access_token).toBe('mock-access-token')
      expect(session.refresh_token).toBe('mock-refresh-token')
      expect(session.token_type).toBe('bearer')
      expect(session.expires_in).toBe(3600)
      expect(session.user).toBeDefined()
    })

    test('creates session with user overrides', () => {
      const session = createMockSession({ email: 'session@example.com' })

      expect(session.user.email).toBe('session@example.com')
    })
  })

  describe('Auth Mock', () => {
    let client: ReturnType<typeof createMockSupabaseClient>

    beforeEach(() => {
      client = createMockSupabaseClient()
    })

    test('getSession returns null initially', async () => {
      const result = await client.auth.getSession()

      expect(result.data.session).toBeNull()
      expect(result.error).toBeNull()
    })

    test('setupMockAuth sets session', async () => {
      setupMockAuth(client, { email: 'auth@example.com' })

      const result = await client.auth.getSession()

      expect(result.data.session).not.toBeNull()
      expect(result.data.session?.user.email).toBe('auth@example.com')
    })

    test('clearMockAuth clears session', async () => {
      setupMockAuth(client)
      clearMockAuth(client)

      const result = await client.auth.getSession()

      expect(result.data.session).toBeNull()
    })

    test('signOut clears session', async () => {
      setupMockAuth(client)
      await client.auth.signOut()

      const result = await client.auth.getSession()

      expect(result.data.session).toBeNull()
    })

    test('onAuthStateChange returns subscription', () => {
      const result = client.auth.onAuthStateChange(() => {})

      expect(result.data.subscription).toBeDefined()
      expect(result.data.subscription.unsubscribe).toBeDefined()
    })
  })

  describe('Storage Mock', () => {
    let client: ReturnType<typeof createMockSupabaseClient>

    beforeEach(() => {
      client = createMockSupabaseClient()
    })

    test('from() returns bucket operations', () => {
      const bucket = client.storage.from('avatars')

      expect(bucket.upload).toBeDefined()
      expect(bucket.download).toBeDefined()
      expect(bucket.remove).toBeDefined()
      expect(bucket.list).toBeDefined()
      expect(bucket.getPublicUrl).toBeDefined()
    })

    test('upload returns path', async () => {
      const bucket = client.storage.from('avatars')
      const result = await bucket.upload('test.jpg', new Blob(['test']))

      expect(result.data?.path).toBe('test/file.jpg')
      expect(result.error).toBeNull()
    })

    test('getPublicUrl returns URL', () => {
      const bucket = client.storage.from('avatars')
      const result = bucket.getPublicUrl('test.jpg')

      expect(result.data.publicUrl).toContain('avatars')
      expect(result.data.publicUrl).toContain('test.jpg')
    })
  })
})
