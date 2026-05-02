import { describe, expect, test } from 'bun:test'
import {
  formatNumber,
  formatRatio,
  formatPercentage,
  formatCompactNumber,
  formatNumberSmart,
  formatPercentageSmart,
} from '../number'

describe('formatNumber - edge cases', () => {
  test('handles NaN', () => {
    expect(formatNumber(Number.NaN)).toBe('NaN')
  })

  test('handles Infinity', () => {
    expect(formatNumber(Number.POSITIVE_INFINITY)).toContain('∞')
    expect(formatNumber(Number.NEGATIVE_INFINITY)).toContain('∞')
  })

  test('handles negative zero', () => {
    expect(formatNumber(-0)).toBe('-0')
    // Intl.NumberFormat preserves -0 in some cases
  })

  test('handles scientific notation input', () => {
    expect(formatNumber(1e10)).toBe('10,000,000,000')
    expect(formatNumber(1e-10, { minimumFractionDigits: 10, maximumFractionDigits: 10 })).toBe(
      '0.0000000001'
    )
  })

  test('handles Number.MAX_SAFE_INTEGER', () => {
    const result = formatNumber(Number.MAX_SAFE_INTEGER)
    expect(result).toBe('9,007,199,254,740,991')
  })

  test('handles Number.MIN_VALUE', () => {
    // Intl.NumberFormat supports max 20 fraction digits
    const result = formatNumber(Number.MIN_VALUE, {
      minimumFractionDigits: 20,
      maximumFractionDigits: 20,
    })
    expect(result).toContain('0.000000')
  })

  test('handles very small numbers', () => {
    expect(formatNumber(0.0001, { minimumFractionDigits: 4, maximumFractionDigits: 4 })).toBe(
      '0.0001'
    )
  })

  test('formats with French locale (space separator)', () => {
    const result = formatNumber(1_234_567, { locale: 'fr-FR' })
    // French uses space/nbsp for thousands
    expect(result).toMatch(/1[\s\u00A0]234[\s\u00A0]567/)
  })

  test('formats with Indian locale (different grouping)', () => {
    const result = formatNumber(1_234_567, { locale: 'en-IN' })
    // Indian numbering: 12,34,567
    expect(result).toMatch(/12,34,567/)
  })
})

describe('formatRatio - edge cases', () => {
  test('handles NaN', () => {
    expect(formatRatio(Number.NaN)).toBe('\u2014')
  })

  test('handles Infinity', () => {
    expect(formatRatio(Number.POSITIVE_INFINITY)).toBe('\u2014')
    expect(formatRatio(Number.NEGATIVE_INFINITY)).toBe('\u2014')
  })

  test('handles negative zero', () => {
    expect(formatRatio(-0)).toBe('0.00')
  })

  test('handles very small ratios', () => {
    expect(formatRatio(0.0001, 4)).toBe('0.0001')
    expect(formatRatio(0.0001, 2)).toBe('0.00')
  })

  test('handles very large ratios', () => {
    expect(formatRatio(999_999.999_999, 2)).toBe('1000000.00')
  })

  test('handles scientific notation', () => {
    expect(formatRatio(1e-5, 6)).toBe('0.000010')
    expect(formatRatio(1e5, 2)).toBe('100000.00')
  })
})

describe('formatPercentage - edge cases', () => {
  test('handles NaN', () => {
    expect(formatPercentage(Number.NaN)).toBe('\u2014')
  })

  test('handles Infinity', () => {
    expect(formatPercentage(Number.POSITIVE_INFINITY)).toBe('\u2014')
    expect(formatPercentage(Number.NEGATIVE_INFINITY)).toBe('\u2014')
  })

  test('handles negative zero', () => {
    expect(formatPercentage(-0)).toBe('0.0%')
  })

  test('handles very small percentages', () => {
    expect(formatPercentage(0.001, 3)).toBe('0.001%')
    expect(formatPercentage(0.001, 1)).toBe('0.0%')
  })

  test('handles very large percentages', () => {
    expect(formatPercentage(999_999.9)).toBe('999999.9%')
    expect(formatPercentage(1_000_000)).toBe('1000000.0%')
  })

  test('handles scientific notation', () => {
    expect(formatPercentage(1e-3, 4)).toBe('0.0010%')
    expect(formatPercentage(1e3, 1)).toBe('1000.0%')
  })
})

describe('formatCompactNumber - edge cases', () => {
  test('handles NaN', () => {
    expect(formatCompactNumber(Number.NaN)).toBe('\u2014')
  })

  test('handles Infinity', () => {
    expect(formatCompactNumber(Number.POSITIVE_INFINITY)).toBe('\u2014')
    expect(formatCompactNumber(Number.NEGATIVE_INFINITY)).toBe('\u2014')
  })

  test('handles negative numbers', () => {
    expect(formatCompactNumber(-1_500_000)).toBe('-1.5M')
    expect(formatCompactNumber(-1000)).toBe('-1.0K')
  })

  test('handles negative zero', () => {
    // -0 < 0 is false, so sign = '', and absValue = 0
    expect(formatCompactNumber(-0)).toBe('0')
  })

  test('handles fractional compact numbers', () => {
    // Uses .toFixed(1)
    expect(formatCompactNumber(1_234_567)).toBe('1.2M')
    // 999,999 < 1e6, so uses K suffix: (999999/1000).toFixed(1) = "1000.0"
    expect(formatCompactNumber(999_999)).toBe('1000.0K')
  })

  test('handles very large numbers', () => {
    const result = formatCompactNumber(Number.MAX_SAFE_INTEGER)
    // Should end with a letter (T/B/M/K)
    expect(result).toMatch(/[A-Z]$/)
  })

  test('handles decimals below threshold', () => {
    expect(formatCompactNumber(0.5)).toBe('0.5')
    // Small values < 1000 use toLocaleString without rounding
    expect(formatCompactNumber(0.123)).toBe('0.123')
  })
})

describe('formatNumberSmart - edge cases', () => {
  test('handles null', () => {
    expect(formatNumberSmart(null)).toBe('N/A')
  })

  test('handles undefined', () => {
    expect(formatNumberSmart(undefined)).toBe('N/A')
  })

  test('handles NaN', () => {
    expect(formatNumberSmart(Number.NaN)).toBe('\u2014')
  })

  test('handles Infinity', () => {
    expect(formatNumberSmart(Number.POSITIVE_INFINITY)).toBe('\u2014')
    expect(formatNumberSmart(Number.NEGATIVE_INFINITY)).toBe('\u2014')
  })

  test('handles negative zero', () => {
    expect(formatNumberSmart(-0)).toBe('0')
  })

  test('strips trailing zeros', () => {
    expect(formatNumberSmart(10)).toBe('10')
    expect(formatNumberSmart(10.5)).toBe('10.5')
    expect(formatNumberSmart(10.5)).toBe('10.5')
  })

  test('respects maxDecimals', () => {
    // For small numbers, uses stripTrailingZeros(value.toFixed(maxDecimals))
    // stripTrailingZeros converts "10.12" to "10.12" but "10.00" to "10"
    expect(formatNumberSmart(10.123_456, 2)).toBe('10.12')
    expect(formatNumberSmart(10.123_456, 4)).toBe('10.1235')
  })
})

describe('formatPercentageSmart - edge cases', () => {
  test('handles null', () => {
    expect(formatPercentageSmart(null)).toBe('N/A')
  })

  test('handles undefined', () => {
    expect(formatPercentageSmart(undefined)).toBe('N/A')
  })

  test('handles NaN', () => {
    expect(formatPercentageSmart(Number.NaN)).toBe('\u2014')
  })

  test('handles Infinity', () => {
    expect(formatPercentageSmart(Number.POSITIVE_INFINITY)).toBe('\u2014')
    expect(formatPercentageSmart(Number.NEGATIVE_INFINITY)).toBe('\u2014')
  })

  test('handles negative zero', () => {
    expect(formatPercentageSmart(-0)).toBe('0%')
  })

  test('strips trailing zeros', () => {
    expect(formatPercentageSmart(10)).toBe('10%')
    expect(formatPercentageSmart(10.5)).toBe('10.5%')
    expect(formatPercentageSmart(10.5)).toBe('10.5%')
  })

  test('respects maxDecimals', () => {
    expect(formatPercentageSmart(10.123_456, 2)).toBe('10.12%')
    expect(formatPercentageSmart(10.123_456, 4)).toBe('10.1235%')
  })
})

describe('edge cases - real-world scenarios', () => {
  test('handles ratio values', () => {
    const ratio = 25.456
    expect(formatRatio(ratio, 2)).toBe('25.46')
  })

  test('handles growth rates', () => {
    const growth = 125.678
    expect(formatPercentage(growth, 1)).toBe('125.7%')
  })

  test('handles very large compact values', () => {
    expect(formatCompactNumber(3_200_000_000_000)).toBe('3.2T')
    expect(formatCompactNumber(45_600_000_000)).toBe('45.6B')
  })

  test('handles precision loss with very large numbers', () => {
    const veryLarge = 9_007_199_254_740_992 // MAX_SAFE_INTEGER + 1
    // May have precision loss
    expect(formatNumber(veryLarge)).toBeTruthy()
  })

  test('handles decimal precision edge cases', () => {
    // 0.1 + 0.2 = 0.30000000000000004
    const imprecise = 0.1 + 0.2
    expect(formatNumber(imprecise, { minimumFractionDigits: 1, maximumFractionDigits: 1 })).toBe(
      '0.3'
    )
  })
})
