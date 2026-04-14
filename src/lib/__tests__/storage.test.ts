import { beforeEach, describe, expect, mock, test } from 'bun:test'
import {
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
  createStorageAccessor,
  zustandStorage,
} from '../storage'

// Mock localStorage
const mockStorage: Record<string, string> = {}
const mockLocalStorage = {
  getItem: mock((key: string) => mockStorage[key] ?? null),
  setItem: mock((key: string, value: string) => {
    mockStorage[key] = value
  }),
  removeItem: mock((key: string) => {
    delete mockStorage[key]
  }),
  clear: mock(() => {
    for (const key of Object.keys(mockStorage)) {
      delete mockStorage[key]
    }
  }),
}

beforeEach(() => {
  // Reset mocks and storage
  mockLocalStorage.getItem.mockClear()
  mockLocalStorage.setItem.mockClear()
  mockLocalStorage.removeItem.mockClear()
  mockLocalStorage.clear.mockClear()
  for (const key of Object.keys(mockStorage)) {
    delete mockStorage[key]
  }
  // Mock global localStorage
  Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true })
})

describe('loadFromStorage', () => {
  // Shared validator for tests
  type ValidType = { type: 'valid'; count: number }
  const validateValidType = (value: unknown): value is ValidType => {
    return (
      typeof value === 'object' &&
      value !== null &&
      'type' in value &&
      value.type === 'valid' &&
      'count' in value &&
      typeof value.count === 'number'
    )
  }

  test('returns defaultValue when storage is empty', () => {
    const result = loadFromStorage({
      key: 'test-key',
      defaultValue: 'default',
    })

    expect(result).toBe('default')
  })

  test('loads and parses JSON from storage', () => {
    mockStorage['test-key'] = JSON.stringify({ name: 'test', value: 42 })

    const result = loadFromStorage({
      key: 'test-key',
      defaultValue: { name: '', value: 0 },
    })

    expect(result).toEqual({ name: 'test', value: 42 })
  })

  test('loads string value from storage', () => {
    mockStorage['locale'] = JSON.stringify('ru')

    const result = loadFromStorage({
      key: 'locale',
      defaultValue: 'en',
    })

    expect(result).toBe('ru')
  })

  test('loads array from storage', () => {
    mockStorage['items'] = JSON.stringify([1, 2, 3])

    const result = loadFromStorage({
      key: 'items',
      defaultValue: [] as number[],
    })

    expect(result).toEqual([1, 2, 3])
  })

  test('returns defaultValue on invalid JSON', () => {
    mockStorage['broken'] = 'not valid json {'

    const result = loadFromStorage({
      key: 'broken',
      defaultValue: 'default',
    })

    expect(result).toBe('default')
  })

  test('uses validator function when provided', () => {
    mockStorage['validated'] = JSON.stringify({ type: 'valid', count: 5 })

    const result = loadFromStorage({
      key: 'validated',
      defaultValue: { type: 'valid', count: 0 } as ValidType,
      validate: validateValidType,
    })

    expect(result).toEqual({ type: 'valid', count: 5 })
  })

  test('returns defaultValue when validation fails', () => {
    mockStorage['validated'] = JSON.stringify({ type: 'invalid', count: 'not a number' })

    const result = loadFromStorage({
      key: 'validated',
      defaultValue: { type: 'valid', count: 0 } as ValidType,
      validate: validateValidType,
    })

    expect(result).toEqual({ type: 'valid', count: 0 })
  })
})

describe('saveToStorage', () => {
  test('saves value to storage as JSON', () => {
    saveToStorage('test-key', { name: 'test', value: 42 })

    expect(mockStorage['test-key']).toBe(JSON.stringify({ name: 'test', value: 42 }))
  })

  test('saves string value', () => {
    saveToStorage('locale', 'ru')

    expect(mockStorage['locale']).toBe(JSON.stringify('ru'))
  })

  test('saves array value', () => {
    saveToStorage('items', [1, 2, 3])

    expect(mockStorage['items']).toBe(JSON.stringify([1, 2, 3]))
  })

  test('saves null value', () => {
    saveToStorage('nullable', null)

    expect(mockStorage['nullable']).toBe('null')
  })

  test('handles storage errors gracefully', () => {
    mockLocalStorage.setItem.mockImplementationOnce(() => {
      throw new Error('QuotaExceededError')
    })

    // Should not throw
    expect(() => saveToStorage('test', 'value')).not.toThrow()
  })
})

describe('removeFromStorage', () => {
  test('removes value from storage', () => {
    mockStorage['to-remove'] = 'value'

    removeFromStorage('to-remove')

    expect(mockStorage['to-remove']).toBeUndefined()
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('to-remove')
  })

  test('handles removal of non-existent key', () => {
    expect(() => removeFromStorage('non-existent')).not.toThrow()
  })

  test('handles storage errors gracefully', () => {
    mockLocalStorage.removeItem.mockImplementationOnce(() => {
      throw new Error('Storage error')
    })

    expect(() => removeFromStorage('key')).not.toThrow()
  })
})

describe('createStorageAccessor', () => {
  test('creates accessor with load/save/remove methods', () => {
    const accessor = createStorageAccessor({
      key: 'test-accessor',
      defaultValue: { count: 0 },
    })

    expect(accessor.load).toBeInstanceOf(Function)
    expect(accessor.save).toBeInstanceOf(Function)
    expect(accessor.remove).toBeInstanceOf(Function)
  })

  test('load returns defaultValue when empty', () => {
    const accessor = createStorageAccessor({
      key: 'test-accessor',
      defaultValue: { count: 0 },
    })

    expect(accessor.load()).toEqual({ count: 0 })
  })

  test('save persists value that can be loaded', () => {
    const accessor = createStorageAccessor({
      key: 'test-accessor',
      defaultValue: { count: 0 },
    })

    accessor.save({ count: 42 })
    expect(accessor.load()).toEqual({ count: 42 })
  })

  test('remove clears stored value', () => {
    const accessor = createStorageAccessor({
      key: 'test-accessor',
      defaultValue: { count: 0 },
    })

    accessor.save({ count: 42 })
    accessor.remove()
    expect(accessor.load()).toEqual({ count: 0 })
  })

  test('supports validation in accessor', () => {
    type Config = { theme: 'dark' | 'light' }
    const validate = (value: unknown): value is Config => {
      return (
        typeof value === 'object' &&
        value !== null &&
        'theme' in value &&
        (value.theme === 'dark' || value.theme === 'light')
      )
    }

    const accessor = createStorageAccessor({
      key: 'config',
      defaultValue: { theme: 'light' } as Config,
      validate,
    })

    // Save valid value
    accessor.save({ theme: 'dark' })
    expect(accessor.load()).toEqual({ theme: 'dark' })

    // Corrupt storage with invalid value
    mockStorage['config'] = JSON.stringify({ theme: 'invalid' })
    expect(accessor.load()).toEqual({ theme: 'light' }) // Returns default
  })
})

describe('zustandStorage', () => {
  test('getItem returns stored value', () => {
    mockStorage['zustand-key'] = 'stored value'

    const result = zustandStorage.getItem('zustand-key')

    expect(result).toBe('stored value')
  })

  test('getItem returns null for missing key', () => {
    const result = zustandStorage.getItem('missing')

    expect(result).toBeNull()
  })

  test('setItem stores value', () => {
    zustandStorage.setItem('zustand-key', 'new value')

    expect(mockStorage['zustand-key']).toBe('new value')
  })

  test('removeItem removes value', () => {
    mockStorage['to-remove'] = 'value'

    zustandStorage.removeItem('to-remove')

    expect(mockStorage['to-remove']).toBeUndefined()
  })

  test('handles errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementationOnce(() => {
      throw new Error('Storage error')
    })

    expect(zustandStorage.getItem('key')).toBeNull()
  })
})
