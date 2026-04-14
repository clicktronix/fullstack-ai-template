import { describe, expect, it } from 'bun:test'
import { formatPriceTenge, formatPriceWithTengeSuffix } from '../price'

describe('formatPriceTenge', () => {
  it('formats price with thousands separator using ru-RU locale', () => {
    // Note: toLocaleString('ru-RU') uses non-breaking space (U+00A0)
    expect(formatPriceTenge(150_000)).toBe('150\u00A0000')
    expect(formatPriceTenge(1_500_000)).toBe('1\u00A0500\u00A0000')
  })

  it('formats small prices without separator', () => {
    expect(formatPriceTenge(500)).toBe('500')
    expect(formatPriceTenge(999)).toBe('999')
  })

  it('formats zero', () => {
    expect(formatPriceTenge(0)).toBe('0')
  })

  it('handles null with default fallback', () => {
    expect(formatPriceTenge(null)).toBe('-')
  })

  it('handles null with custom fallback', () => {
    expect(formatPriceTenge(null, { fallback: 'N/A' })).toBe('N/A')
    expect(formatPriceTenge(null, { fallback: '' })).toBe('')
  })

  it('respects locale option', () => {
    expect(formatPriceTenge(1_500_000, { locale: 'en-US' })).toBe('1,500,000')
    expect(formatPriceTenge(1_500_000, { locale: 'de-DE' })).toBe('1.500.000')
  })

  it('adds currency symbol when provided', () => {
    expect(formatPriceTenge(150_000, { currencySymbol: ' tg' })).toBe('150\u00A0000 tg')
    expect(formatPriceTenge(150_000, { currencySymbol: ' KZT' })).toBe('150\u00A0000 KZT')
  })

  it('handles combination of options', () => {
    expect(formatPriceTenge(150_000, { locale: 'en-US', currencySymbol: ' tg' })).toBe('150,000 tg')
  })

  it('handles negative prices', () => {
    // Negative prices may occur in refunds or adjustments
    expect(formatPriceTenge(-50_000)).toBe('-50\u00A0000')
  })

  it('handles decimal prices', () => {
    // ru-RU uses comma as decimal separator
    expect(formatPriceTenge(150_000.5)).toBe('150\u00A0000,5')
  })
})

describe('formatPriceWithTengeSuffix', () => {
  it('formats price with tenge suffix', () => {
    expect(formatPriceWithTengeSuffix(150_000)).toBe('150\u00A0000 tg')
    expect(formatPriceWithTengeSuffix(50_000)).toBe('50\u00A0000 tg')
  })

  it('handles null with default fallback', () => {
    expect(formatPriceWithTengeSuffix(null)).toBe('-')
  })

  it('handles null with custom fallback', () => {
    expect(formatPriceWithTengeSuffix(null, { fallback: 'N/A' })).toBe('N/A')
  })

  it('respects locale option', () => {
    expect(formatPriceWithTengeSuffix(150_000, { locale: 'en-US' })).toBe('150,000 tg')
  })

  it('handles zero', () => {
    expect(formatPriceWithTengeSuffix(0)).toBe('0 tg')
  })
})
