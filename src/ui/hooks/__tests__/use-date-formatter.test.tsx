import { renderHook } from '@testing-library/react'
import { beforeEach, describe, test, expect } from 'bun:test'
import { type ReactNode } from 'react'
import { IntlProvider } from 'react-intl'
import { enMessages } from '@/infrastructure/i18n/locales/en'
import { LocaleProvider, type Locale } from '@/ui/providers/LocaleContext'
import { useDateFormatter } from '../use-date-formatter'

// Helper to create wrapper with specific locale
function createWrapper(initialLocale: Locale = 'en') {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <LocaleProvider initialLocale={initialLocale}>
        <IntlProvider locale={initialLocale} messages={enMessages}>
          {children}
        </IntlProvider>
      </LocaleProvider>
    )
  }
}

describe('useDateFormatter', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('short format', () => {
    test('formats date string with short format', () => {
      const { result } = renderHook(() => useDateFormatter(), {
        wrapper: createWrapper('en'),
      })
      const formatted = result.current.short('2024-01-15')
      expect(formatted).toContain('15')
      expect(formatted).toContain('Jan')
    })

    test('formats Date object with short format', () => {
      const { result } = renderHook(() => useDateFormatter(), {
        wrapper: createWrapper('en'),
      })
      const formatted = result.current.short(new Date('2024-06-20'))
      expect(formatted).toContain('20')
      expect(formatted).toContain('Jun')
    })
  })

  describe('medium format', () => {
    test('formats date with day, month, and year', () => {
      const { result } = renderHook(() => useDateFormatter(), {
        wrapper: createWrapper('en'),
      })
      const formatted = result.current.medium('2024-01-15')
      expect(formatted).toContain('15')
      expect(formatted).toContain('Jan')
      expect(formatted).toContain('2024')
    })

    test('formats Date object with medium format', () => {
      const { result } = renderHook(() => useDateFormatter(), {
        wrapper: createWrapper('en'),
      })
      const formatted = result.current.medium(new Date('2024-12-25'))
      expect(formatted).toContain('25')
      expect(formatted).toContain('Dec')
      expect(formatted).toContain('2024')
    })
  })

  describe('full format', () => {
    test('formats date with full month name', () => {
      const { result } = renderHook(() => useDateFormatter(), {
        wrapper: createWrapper('en'),
      })
      const formatted = result.current.full('2024-01-15')
      expect(formatted).toContain('15')
      expect(formatted).toContain('January')
      expect(formatted).toContain('2024')
    })

    test('formats Date object with full format', () => {
      const { result } = renderHook(() => useDateFormatter(), {
        wrapper: createWrapper('en'),
      })
      const formatted = result.current.full(new Date('2024-03-01'))
      expect(formatted).toContain('1')
      expect(formatted).toContain('March')
      expect(formatted).toContain('2024')
    })
  })

  describe('formatter stability', () => {
    test('short formatter is stable across renders', () => {
      const { result, rerender } = renderHook(() => useDateFormatter(), {
        wrapper: createWrapper('en'),
      })

      const firstShort = result.current.short
      rerender()

      expect(result.current.short).toBe(firstShort)
    })

    test('medium formatter is stable across renders', () => {
      const { result, rerender } = renderHook(() => useDateFormatter(), {
        wrapper: createWrapper('en'),
      })

      const firstMedium = result.current.medium
      rerender()

      expect(result.current.medium).toBe(firstMedium)
    })

    test('full formatter is stable across renders', () => {
      const { result, rerender } = renderHook(() => useDateFormatter(), {
        wrapper: createWrapper('en'),
      })

      const firstFull = result.current.full
      rerender()

      expect(result.current.full).toBe(firstFull)
    })
  })

  describe('edge cases', () => {
    test('handles ISO date string with time', () => {
      const { result } = renderHook(() => useDateFormatter(), {
        wrapper: createWrapper('en'),
      })
      const formatted = result.current.short('2024-01-15T10:30:00Z')
      expect(formatted).toContain('15')
      expect(formatted).toContain('Jan')
    })

    test('handles date at year boundary', () => {
      const { result } = renderHook(() => useDateFormatter(), {
        wrapper: createWrapper('en'),
      })
      const formatted = result.current.medium('2024-12-31')
      expect(formatted).toContain('31')
      expect(formatted).toContain('Dec')
      expect(formatted).toContain('2024')
    })
  })
})
