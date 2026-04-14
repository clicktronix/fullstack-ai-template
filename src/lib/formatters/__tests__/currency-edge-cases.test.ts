import { describe, expect, test } from 'bun:test'
import { formatCurrency, formatCompactCurrency, formatCurrencySmart } from '../currency'

describe('formatCurrency - edge cases', () => {
  test('handles NaN', () => {
    expect(formatCurrency(Number.NaN)).toBe('$NaN')
  })

  test('handles Infinity', () => {
    expect(formatCurrency(Number.POSITIVE_INFINITY)).toContain('∞')
    expect(formatCurrency(Number.NEGATIVE_INFINITY)).toContain('∞')
  })

  test('handles very small numbers', () => {
    expect(formatCurrency(0.0001)).toBe('$0.00')
    expect(formatCurrency(0.0001, { minimumFractionDigits: 4, maximumFractionDigits: 4 })).toBe(
      '$0.0001'
    )
  })

  test('handles very large numbers', () => {
    const maxSafe = Number.MAX_SAFE_INTEGER // 9007199254740991
    const result = formatCurrency(maxSafe)
    expect(result).toContain('9,007,199,254,740,991')
  })

  test('handles negative zero', () => {
    expect(formatCurrency(-0)).toBe('-$0.00')
    // Note: Intl.NumberFormat preserves -0 in some cases
  })

  test('handles scientific notation input', () => {
    expect(formatCurrency(1e10)).toBe('$10,000,000,000.00')
    expect(formatCurrency(1e-10, { minimumFractionDigits: 10, maximumFractionDigits: 10 })).toBe(
      '$0.0000000001'
    )
  })

  test('formats with Russian locale (space separator)', () => {
    const result = formatCurrency(1_234_567.89, { locale: 'ru-RU', currency: 'RUB' })
    // Russian uses space for thousands and comma for decimals
    expect(result).toMatch(/1[\s\u00A0]234[\s\u00A0]567/)
  })

  test('formats with French locale', () => {
    const result = formatCurrency(1_234_567.89, { locale: 'fr-FR', currency: 'EUR' })
    // French uses space/nbsp for thousands and comma for decimals
    expect(result).toMatch(/1[\s\u00A0]234[\s\u00A0]567/)
  })

  test('handles minimum/maximum fraction digits constraints', () => {
    // More max than min
    expect(formatCurrency(10, { minimumFractionDigits: 0, maximumFractionDigits: 4 })).toBe('$10')

    // Force trailing zeros
    expect(formatCurrency(10, { minimumFractionDigits: 4, maximumFractionDigits: 4 })).toBe(
      '$10.0000'
    )
  })

  test('handles edge case currencies', () => {
    // Japanese Yen - formatCurrency uses minimumFractionDigits=2 by default
    // so it will show decimals unless explicitly set to 0
    const yenResult = formatCurrency(1234, {
      currency: 'JPY',
      locale: 'ja-JP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    // Note: Yen symbol can be ¥ (U+00A5) or ￥ (U+FFE5 fullwidth) depending on ICU
    expect(yenResult).toMatch(/[¥￥]/)
    expect(yenResult).not.toContain('.')

    // Kuwaiti Dinar (3 decimal places) - use en-US to avoid Arabic numerals
    // Note: ICU data differs between environments (macOS vs Ubuntu),
    // so we use regex to handle variations in spacing/formatting
    const kdResult = formatCurrency(1234.567, {
      currency: 'KWD',
      locale: 'en-US',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    })
    expect(kdResult).toMatch(/KWD/)
    expect(kdResult).toMatch(/1[,.\s]?234[,.]567/)
  })
})

describe('formatCompactCurrency - edge cases', () => {
  test('handles NaN', () => {
    expect(formatCompactCurrency(Number.NaN)).toContain('NaN')
  })

  test('handles Infinity', () => {
    // .toFixed() returns "Infinity" string, so result is "$InfinityT"
    expect(formatCompactCurrency(Number.POSITIVE_INFINITY)).toBe('$InfinityT')
  })

  test('handles negative numbers', () => {
    expect(formatCompactCurrency(-1_500_000)).toBe('-$1.5M')
    expect(formatCompactCurrency(-1_000_000_000)).toBe('-$1B')
  })

  test('handles fractional scale numbers', () => {
    // maxDecimals defaults to 1
    expect(formatCompactCurrency(1_234_567)).toBe('$1.2M')
    // 999,999 < 1e6, so uses K suffix: (999999/1000).toFixed(1) = "1000.0"
    expect(formatCompactCurrency(999_999)).toBe('$1000K')
    // With maxDecimals=2
    expect(formatCompactCurrency(1_234_567, { maxDecimals: 2 })).toBe('$1.23M')
  })

  test('handles very small compact numbers', () => {
    expect(formatCompactCurrency(0.5)).toBe('$0.5')
    expect(formatCompactCurrency(0.01)).toBe('$0.01')
  })

  test('handles negative zero', () => {
    expect(formatCompactCurrency(-0)).toBe('$0')
  })

  test('handles max safe integer', () => {
    const result = formatCompactCurrency(Number.MAX_SAFE_INTEGER)
    expect(result).toMatch(/T/) // Should be in trillions
  })

  test('handles custom currency in compact mode', () => {
    const result = formatCompactCurrency(1_500_000, { currency: 'EUR', locale: 'de-DE' })
    expect(result).toMatch(/€/)
    // Compact formatter uses .toFixed(), not locale-aware decimal separator
    expect(result).toBe('€1.5M')
  })
})

describe('formatCurrencySmart - edge cases', () => {
  test('handles null', () => {
    expect(formatCurrencySmart(null)).toBe('N/A')
  })

  test('handles undefined', () => {
    expect(formatCurrencySmart(undefined)).toBe('N/A')
  })

  test('handles NaN', () => {
    expect(formatCurrencySmart(Number.NaN)).toContain('NaN')
  })

  test('handles Infinity', () => {
    // Uses formatCompactCurrency which returns "$InfinityT"
    expect(formatCurrencySmart(Number.POSITIVE_INFINITY)).toBe('$InfinityT')
  })

  test('handles zero', () => {
    expect(formatCurrencySmart(0)).toBe('$0')
  })

  test('handles negative zero', () => {
    expect(formatCurrencySmart(-0)).toBe('$0')
  })

  test('strips trailing zeros from decimals', () => {
    expect(formatCurrencySmart(10.5)).toBe('$10.5')
    expect(formatCurrencySmart(10)).toBe('$10')
    // formatCurrencySmart uses compact formatter for small numbers
    // which uses toLocaleString without maxDecimals constraint
    expect(formatCurrencySmart(10.123)).toBe('$10.123')
  })

  test('handles very small values', () => {
    // Compact formatter doesn't truncate small values < 1000
    expect(formatCurrencySmart(0.001)).toBe('$0.001')
    expect(formatCurrencySmart(0.001, 3)).toBe('$0.001')
  })

  test('handles very large values', () => {
    // formatCurrencySmart uses formatCompactCurrency, so large values get compact notation
    expect(formatCurrencySmart(1_234_567.89)).toBe('$1.2M')
  })
})

describe('edge cases - real-world scenarios', () => {
  test('handles crypto prices with many decimals', () => {
    const btcPrice = 45_123.456_789
    expect(formatCurrency(btcPrice, { minimumFractionDigits: 2, maximumFractionDigits: 6 })).toBe(
      '$45,123.456789'
    )
  })

  test('handles penny stocks', () => {
    expect(formatCurrency(0.0001, { minimumFractionDigits: 4, maximumFractionDigits: 4 })).toBe(
      '$0.0001'
    )
  })

  test('handles market cap in trillions', () => {
    const marketCap = 3_200_000_000_000
    expect(formatCompactCurrency(marketCap)).toBe('$3.2T')
  })

  test('handles negative balances', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56')
    expect(formatCompactCurrency(-5_500_000)).toBe('-$5.5M')
  })

  test('handles rounding edge cases', () => {
    // Intl.NumberFormat rounds 999.995 to 1000.00 (not banker's rounding)
    expect(formatCurrency(999.995)).toBe('$1,000.00')
    expect(formatCurrency(999.996)).toBe('$1,000.00')
    expect(formatCurrency(999.994)).toBe('$999.99')
  })
})
