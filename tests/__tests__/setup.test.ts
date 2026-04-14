/// <reference lib="dom" />

/**
 * Tests for test setup verification
 *
 * These tests verify that the testing infrastructure is properly configured:
 * - DOM environment (happy-dom)
 * - Browser API mocks
 * - Basic assertions
 */

import { describe, expect, test } from 'bun:test'

describe('Test Setup Verification', () => {
  describe('DOM Environment', () => {
    test('document is available', () => {
      expect(document).toBeDefined()
      expect(typeof document.createElement).toBe('function')
    })

    test('window is available', () => {
      expect(globalThis).toBeDefined()
      expect(typeof window.addEventListener).toBe('function')
    })

    test('can create and manipulate DOM elements', () => {
      const div = document.createElement('div')
      div.textContent = 'Hello, Test!'
      div.dataset.testid = 'test-div'

      expect(div.textContent).toBe('Hello, Test!')
      expect(div.dataset.testid).toBe('test-div')
    })

    test('can append elements to body', () => {
      const span = document.createElement('span')
      span.id = 'test-span'
      document.body.append(span)

      const found = document.querySelector('#test-span')
      expect(found).toBeTruthy()

      // Cleanup
      span.remove()
    })
  })

  describe('Browser API Mocks', () => {
    test('ResizeObserver is mocked', () => {
      expect(ResizeObserver).toBeDefined()

      const observer = new ResizeObserver(() => {})
      expect(typeof observer.observe).toBe('function')
      expect(typeof observer.unobserve).toBe('function')
      expect(typeof observer.disconnect).toBe('function')
    })

    test('IntersectionObserver is mocked', () => {
      expect(IntersectionObserver).toBeDefined()

      const observer = new IntersectionObserver(() => {})
      expect(typeof observer.observe).toBe('function')
      expect(typeof observer.unobserve).toBe('function')
      expect(typeof observer.disconnect).toBe('function')
    })

    test('matchMedia is mocked', () => {
      expect(globalThis.matchMedia).toBeDefined()

      const mq = globalThis.matchMedia('(min-width: 768px)')
      expect(mq.matches).toBe(false)
      expect(typeof mq.addEventListener).toBe('function')
    })

    test('scrollTo is mocked', () => {
      expect(window.scrollTo).toBeDefined()
      // Should not throw
      window.scrollTo(0, 0)
    })

    test('localStorage is mocked', () => {
      expect(globalThis.localStorage).toBeDefined()

      globalThis.localStorage.setItem('test-key', 'test-value')
      expect(globalThis.localStorage.getItem('test-key')).toBe('test-value')

      globalThis.localStorage.removeItem('test-key')
      expect(globalThis.localStorage.getItem('test-key')).toBeNull()
    })
  })

  describe('Bun Test Assertions', () => {
    test('basic equality assertions work', () => {
      expect(1 + 1).toBe(2)
      expect('hello').toBe('hello')
      expect({ a: 1 }).toEqual({ a: 1 })
    })

    test('truthy/falsy assertions work', () => {
      expect(true).toBeTruthy()
      expect(false).toBeFalsy()
      expect(null).toBeNull()
      expect(undefined).toBeUndefined()
    })

    test('array assertions work', () => {
      const arr = [1, 2, 3]
      expect(arr).toContain(2)
      expect(arr).toHaveLength(3)
    })

    test('async/await works', async () => {
      const result = await Promise.resolve('async value')
      expect(result).toBe('async value')
    })

    test('mocking works', () => {
      const mockFn = () => 'mocked'
      expect(mockFn()).toBe('mocked')
    })
  })
})
