import { describe, expect, test } from 'bun:test'
import {
  formatCurrency,
  formatCompactCurrency,
  createCompactCurrencyFormatter,
  createCurrencyFormatter,
  formatCurrencySmart,
  formatCurrencyNullable,
} from '../currency'

describe('formatCurrency', () => {
  describe('default options (USD, en-US)', () => {
    test('formats positive numbers', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })

    test('formats negative numbers', () => {
      expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
    })

    test('formats zero', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })

    test('formats small decimals', () => {
      expect(formatCurrency(0.99)).toBe('$0.99')
    })

    test('formats large numbers with comma separators', () => {
      expect(formatCurrency(1_000_000)).toBe('$1,000,000.00')
    })
  })

  describe('custom currency', () => {
    test('formats EUR', () => {
      const result = formatCurrency(1234.56, { currency: 'EUR' })
      expect(result).toContain('1,234.56')
      expect(result).toMatch(/€/)
    })

    test('formats GBP', () => {
      const result = formatCurrency(1234.56, { currency: 'GBP' })
      expect(result).toContain('1,234.56')
      expect(result).toMatch(/£/)
    })

    test('formats JPY (no decimals typically)', () => {
      const result = formatCurrency(1234, { currency: 'JPY' })
      expect(result).toMatch(/¥/)
    })
  })

  describe('custom locale', () => {
    test('formats with German locale (comma as decimal)', () => {
      const result = formatCurrency(1234.56, { currency: 'EUR', locale: 'de-DE' })
      // German uses comma for decimals and period for thousands
      expect(result).toMatch(/1\.234,56/)
    })
  })

  describe('custom fraction digits', () => {
    test('formats with no decimals', () => {
      expect(formatCurrency(1234.56, { minimumFractionDigits: 0, maximumFractionDigits: 0 })).toBe(
        '$1,235'
      )
    })

    test('formats with 4 decimals', () => {
      expect(
        formatCurrency(1234.5678, { minimumFractionDigits: 4, maximumFractionDigits: 4 })
      ).toBe('$1,234.5678')
    })
  })
})

describe('formatCompactCurrency', () => {
  describe('scale formatting', () => {
    test('formats trillions', () => {
      expect(formatCompactCurrency(1_500_000_000_000)).toBe('$1.5T')
      expect(formatCompactCurrency(2_000_000_000_000)).toBe('$2T') // Trailing zeros stripped
    })

    test('formats billions', () => {
      expect(formatCompactCurrency(1_500_000_000)).toBe('$1.5B')
      expect(formatCompactCurrency(1_000_000_000)).toBe('$1B') // Trailing zeros stripped
    })

    test('formats millions', () => {
      expect(formatCompactCurrency(2_500_000)).toBe('$2.5M')
      expect(formatCompactCurrency(1_000_000)).toBe('$1M') // Trailing zeros stripped
    })

    test('formats thousands', () => {
      expect(formatCompactCurrency(5500)).toBe('$5.5K')
      expect(formatCompactCurrency(1000)).toBe('$1K') // Trailing zeros stripped
    })

    test('formats small numbers without scale', () => {
      expect(formatCompactCurrency(500)).toBe('$500')
      expect(formatCompactCurrency(99)).toBe('$99')
    })
  })

  describe('negative values', () => {
    test('formats negative trillions', () => {
      expect(formatCompactCurrency(-1_500_000_000_000)).toBe('-$1.5T')
    })

    test('formats negative billions', () => {
      expect(formatCompactCurrency(-1_500_000_000)).toBe('-$1.5B')
    })

    test('formats negative millions', () => {
      expect(formatCompactCurrency(-2_500_000)).toBe('-$2.5M')
    })

    test('formats negative thousands', () => {
      expect(formatCompactCurrency(-5500)).toBe('-$5.5K')
    })

    test('formats negative small numbers', () => {
      expect(formatCompactCurrency(-500)).toBe('-$500')
    })
  })

  describe('zero and edge cases', () => {
    test('formats zero', () => {
      expect(formatCompactCurrency(0)).toBe('$0')
    })

    test('formats boundary values', () => {
      // Just under billion
      expect(formatCompactCurrency(999_999_999)).toBe('$1000M') // Trailing zeros stripped
      // Exactly at trillion
      expect(formatCompactCurrency(1_000_000_000_000)).toBe('$1T') // Trailing zeros stripped
    })
  })

  describe('custom currency', () => {
    test('formats EUR with euro symbol', () => {
      const result = formatCompactCurrency(1_500_000, { currency: 'EUR' })
      expect(result).toMatch(/€1\.5M/)
    })

    test('formats GBP with pound symbol', () => {
      const result = formatCompactCurrency(1_500_000, { currency: 'GBP' })
      expect(result).toMatch(/£1\.5M/)
    })
  })
})

describe('createCompactCurrencyFormatter', () => {
  test('creates formatter with default options', () => {
    const formatter = createCompactCurrencyFormatter()
    expect(formatter(1_500_000)).toBe('$1.5M')
  })

  test('creates formatter with custom currency', () => {
    const formatter = createCompactCurrencyFormatter({ currency: 'EUR' })
    expect(formatter(1_500_000)).toMatch(/€1\.5M/)
  })

  test('formatter can be reused', () => {
    const formatter = createCompactCurrencyFormatter()
    expect(formatter(1_000_000)).toBe('$1M') // Trailing zeros stripped
    expect(formatter(2_000_000)).toBe('$2M') // Trailing zeros stripped
    expect(formatter(500)).toBe('$500')
  })
})

describe('createCurrencyFormatter', () => {
  test('creates formatter with default options', () => {
    const formatter = createCurrencyFormatter()
    expect(formatter(1234.56)).toBe('$1,234.56')
  })

  test('creates formatter with custom options', () => {
    const formatter = createCurrencyFormatter({ currency: 'EUR', locale: 'en-US' })
    const result = formatter(1234.56)
    expect(result).toMatch(/€/)
    expect(result).toContain('1,234.56')
  })

  test('formatter can be reused', () => {
    const formatter = createCurrencyFormatter()
    expect(formatter(100)).toBe('$100.00')
    expect(formatter(200)).toBe('$200.00')
  })
})

describe('formatCurrencySmart', () => {
  describe('null/undefined handling', () => {
    test('returns N/A for null', () => {
      expect(formatCurrencySmart(null)).toBe('N/A')
    })

    test('returns N/A for undefined', () => {
      expect(formatCurrencySmart(undefined)).toBe('N/A')
    })
  })

  describe('compact formatting', () => {
    test('formats trillions', () => {
      expect(formatCurrencySmart(1_500_000_000_000)).toBe('$1.5T')
    })

    test('formats billions', () => {
      expect(formatCurrencySmart(1_500_000_000)).toBe('$1.5B')
    })

    test('formats millions', () => {
      expect(formatCurrencySmart(1_500_000)).toBe('$1.5M')
    })

    test('formats thousands', () => {
      expect(formatCurrencySmart(5500)).toBe('$5.5K')
    })

    test('formats small numbers', () => {
      expect(formatCurrencySmart(500)).toBe('$500')
    })
  })

  describe('custom maxDecimals', () => {
    test('respects maxDecimals for millions', () => {
      expect(formatCurrencySmart(1_234_567, 2)).toBe('$1.23M')
    })

    test('respects maxDecimals for thousands', () => {
      expect(formatCurrencySmart(1234, 2)).toBe('$1.23K')
    })
  })

  describe('custom currency options', () => {
    test('formats EUR', () => {
      const result = formatCurrencySmart(1_500_000, 1, { currency: 'EUR' })
      expect(result).toMatch(/€1\.5M/)
    })

    test('formats GBP', () => {
      const result = formatCurrencySmart(1_500_000, 1, { currency: 'GBP' })
      expect(result).toMatch(/£1\.5M/)
    })
  })

  test('formats zero', () => {
    expect(formatCurrencySmart(0)).toBe('$0')
  })

  test('formats negative values', () => {
    expect(formatCurrencySmart(-1_500_000)).toBe('-$1.5M')
  })
})

describe('formatCurrencyNullable', () => {
  describe('null/undefined handling', () => {
    test('returns N/A for null', () => {
      expect(formatCurrencyNullable(null)).toBe('N/A')
    })

    test('returns N/A for undefined', () => {
      expect(formatCurrencyNullable(undefined)).toBe('N/A')
    })
  })

  describe('standard formatting', () => {
    test('formats with default 2 decimals', () => {
      expect(formatCurrencyNullable(1234.56)).toBe('$1,234.56')
    })

    test('formats with custom decimals', () => {
      expect(formatCurrencyNullable(1234.5678, 4)).toBe('$1,234.5678')
      expect(formatCurrencyNullable(1234.56, 0)).toBe('$1,235')
    })

    test('formats small numbers', () => {
      expect(formatCurrencyNullable(0.99)).toBe('$0.99')
    })

    test('formats large numbers with comma separators', () => {
      expect(formatCurrencyNullable(1_000_000)).toBe('$1,000,000.00')
    })
  })

  test('formats zero', () => {
    expect(formatCurrencyNullable(0)).toBe('$0.00')
  })

  test('formats negative values', () => {
    expect(formatCurrencyNullable(-1234.56)).toBe('$-1,234.56')
  })
})
