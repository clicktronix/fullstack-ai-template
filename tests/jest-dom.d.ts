/// <reference types="@testing-library/jest-dom" />

/**
 * Type declarations for @testing-library/jest-dom matchers
 *
 * This file extends Bun's expect types with jest-dom matchers.
 * These matchers are available globally after importing '@testing-library/jest-dom'
 * in the test setup file.
 */

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare module 'bun:test' {
  interface Matchers<T> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
  interface AsymmetricMatchers extends TestingLibraryMatchers<unknown, unknown> {}
}
