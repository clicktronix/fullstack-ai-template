import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test } from 'bun:test'
import { type ReactNode } from 'react'
import { LOCALE_COOKIE_NAME, LOCALE_STORAGE_KEY } from '@/lib/constants'
import { LocaleProvider, useLocale, type Locale } from '../LocaleContext'

// Helper for creating a wrapper with the requested locale.
function createWrapper(initialLocale?: Locale) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
  }
}

beforeEach(() => {
  // Clear localStorage before each test.
  localStorage.clear()
})

describe('LocaleProvider', () => {
  describe('initial state', () => {
    test('uses "en" as the default locale', () => {
      const { result } = renderHook(() => useLocale(), {
        wrapper: createWrapper(),
      })

      expect(result.current.locale).toBe('en')
    })

    test('accepts initialLocale through props', () => {
      const { result } = renderHook(() => useLocale(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.locale).toBe('en')
    })
  })

  describe('locale changes', () => {
    test('allows setting the supported locale through setLocale', async () => {
      const { result } = renderHook(() => useLocale(), {
        wrapper: createWrapper('en'),
      })

      await act(async () => {
        result.current.setLocale('en')
      })

      expect(result.current.locale).toBe('en')
    })

    test('persists changed locale in localStorage', async () => {
      const { result } = renderHook(() => useLocale(), {
        wrapper: createWrapper('en'),
      })

      await act(async () => {
        result.current.setLocale('en')
      })

      const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
      expect(stored).toBe('"en"')
    })
  })

  describe('localStorage integration', () => {
    test('persists initial locale in localStorage on mount', async () => {
      renderHook(() => useLocale(), {
        wrapper: createWrapper('en'),
      })

      // useEffect with saveToStorage runs after render.
      await waitFor(() => {
        const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
        expect(stored).toBe('"en"')
      })
    })

    test('restores locale from localStorage when value is valid', async () => {
      localStorage.setItem(LOCALE_STORAGE_KEY, '"en"')

      const { result } = renderHook(() => useLocale(), {
        wrapper: createWrapper('en'),
      })

      await waitFor(() => {
        expect(result.current.locale).toBe('en')
      })
    })

    test('restores locale from cookie when localStorage is empty', async () => {
      const cookieDescriptor = Object.getOwnPropertyDescriptor(document, 'cookie')
      Object.defineProperty(document, 'cookie', {
        configurable: true,
        get: () => `${LOCALE_COOKIE_NAME}=en`,
        set: () => undefined,
      })

      const { result } = renderHook(() => useLocale(), {
        wrapper: createWrapper('en'),
      })

      await waitFor(() => {
        expect(result.current.locale).toBe('en')
      })

      if (cookieDescriptor) {
        Object.defineProperty(document, 'cookie', cookieDescriptor)
      } else {
        Reflect.deleteProperty(document, 'cookie')
      }
    })

    test('ignores invalid JSON in localStorage', () => {
      localStorage.setItem(LOCALE_STORAGE_KEY, 'not-json')

      const { result } = renderHook(() => useLocale(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.locale).toBe('en')
    })
  })

  describe('context stability', () => {
    test('setLocale is stable between rerenders', () => {
      const { result, rerender } = renderHook(() => useLocale(), {
        wrapper: createWrapper('en'),
      })

      const firstSetLocale = result.current.setLocale
      rerender()

      expect(result.current.setLocale).toBe(firstSetLocale)
    })

    test('context value is memoized when locale does not change', () => {
      const values: Array<{ locale: Locale }> = []

      const { rerender } = renderHook(
        () => {
          const ctx = useLocale()
          values.push({ locale: ctx.locale })
          return ctx
        },
        { wrapper: createWrapper('en') }
      )

      rerender()

      // Locale did not change, so the value is the same.
      expect(values[0].locale).toBe(values[1].locale)
    })
  })
})

describe('useLocale', () => {
  test('throws when used outside LocaleProvider', () => {
    // renderHook with useLocale without a wrapper should throw.
    expect(() => {
      renderHook(() => useLocale())
    }).toThrow('useLocale must be used within LocaleProvider')
  })
})
