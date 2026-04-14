import { renderHook } from '@testing-library/react'
import { describe, expect, test } from 'bun:test'
import { type ReactNode } from 'react'
import { LocaleProvider, type Locale } from '@/ui/providers/LocaleContext'
import { useFormatters } from '../use-formatters'

// Helper to create wrapper with specific locale
function createWrapper(initialLocale: Locale = 'en') {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
  }
}

describe('useFormatters', () => {
  describe('currency formatting', () => {
    test('formats currency in en-US format', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.currency(1234.56)).toMatch(/\$1,234\.56/)
    })

    test('formats large currency values', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.currency(1_000_000)).toMatch(/\$1,000,000/)
    })

    test('formats zero currency', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.currency(0)).toMatch(/\$0/)
    })

    test('formats negative currency', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      const formatted = result.current.currency(-1234.56)
      expect(formatted).toMatch(/1,234\.56/)
      expect(formatted).toMatch(/-/)
    })
  })

  describe('compact currency formatting', () => {
    test('formats millions as M', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      const formatted = result.current.compactCurrency(1_500_000)
      expect(formatted).toMatch(/1\.5/)
      expect(formatted).toMatch(/M/)
    })

    test('formats billions as B', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      const formatted = result.current.compactCurrency(2_500_000_000)
      expect(formatted).toMatch(/2\.5/)
      expect(formatted).toMatch(/B/)
    })

    test('formats thousands as K', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      const formatted = result.current.compactCurrency(5000)
      expect(formatted).toMatch(/5/)
      expect(formatted).toMatch(/K/)
    })
  })

  describe('number formatting', () => {
    test('formats number with separators', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.number(1_234_567.89)).toBe('1,234,567.89')
    })

    test('formats integer without decimals', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.number(1_234_567)).toBe('1,234,567')
    })

    test('formats zero', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.number(0)).toBe('0')
    })
  })

  describe('compact number formatting', () => {
    test('formats millions compactly', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.compactNumber(1_500_000)).toMatch(/1\.5M/)
    })

    test('formats small numbers without suffix', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.compactNumber(500)).toBe('500')
    })
  })

  describe('ratio formatting', () => {
    test('formats ratio with default 2 decimals', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.ratio(1.234_567)).toBe('1.23')
    })

    test('formats ratio with custom decimals', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.ratio(1.234_567, 4)).toBe('1.2346')
    })

    test('formats negative ratio', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.ratio(-0.5)).toBe('-0.50')
    })
  })

  describe('percentage formatting', () => {
    test('formats percentage with default 1 decimal', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.percentage(15.567)).toBe('15.6%')
    })

    test('formats percentage with custom decimals', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.percentage(15.567, 2)).toBe('15.57%')
    })

    test('formats zero percentage', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.percentage(0)).toBe('0.0%')
    })

    test('formats negative percentage', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.percentage(-5.5)).toBe('-5.5%')
    })
  })

  describe('formatter functions for charts', () => {
    test('compactCurrencyFormatter is stable across renders', () => {
      const { result, rerender } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      const firstFormatter = result.current.compactCurrencyFormatter
      rerender()

      expect(result.current.compactCurrencyFormatter).toBe(firstFormatter)
    })

    test('ratioFormatter is stable across renders', () => {
      const { result, rerender } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      const firstFormatter = result.current.ratioFormatter
      rerender()

      expect(result.current.ratioFormatter).toBe(firstFormatter)
    })

    test('percentageFormatter is stable across renders', () => {
      const { result, rerender } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      const firstFormatter = result.current.percentageFormatter
      rerender()

      expect(result.current.percentageFormatter).toBe(firstFormatter)
    })

    test('compactCurrencyFormatter works correctly', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      const formatted = result.current.compactCurrencyFormatter(1_500_000)
      expect(formatted).toMatch(/1\.5/)
      expect(formatted).toMatch(/M/)
    })
  })

  describe('custom currency option', () => {
    test('allows overriding default currency', () => {
      const { result } = renderHook(() => useFormatters({ currency: 'EUR' }), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.currencyCode).toBe('EUR')
    })

    test('uses USD as default currency', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.currencyCode).toBe('USD')
    })
  })

  describe('locale', () => {
    test('returns locale string', () => {
      const { result } = renderHook(() => useFormatters(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.locale).toBe('en-US')
    })
  })
})
