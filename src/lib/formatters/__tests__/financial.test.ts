import { describe, expect, it } from 'bun:test'
import {
  formatPnL,
  formatSignedPercentage,
  formatPrice,
  formatPriceOrFallback,
  formatQuantity,
  formatPercentageOrFallback,
  getPnLColor,
  getPercentageChangeColor,
  isProfitable,
} from '../financial'

describe('formatPnL', () => {
  it('formats positive values with plus sign', () => {
    expect(formatPnL(1234.56)).toBe('+$1234.56')
    expect(formatPnL(100)).toBe('+$100.00')
  })

  it('formats negative values with minus sign', () => {
    expect(formatPnL(-1234.56)).toBe('-$1234.56')
    expect(formatPnL(-100)).toBe('-$100.00')
  })

  it('formats zero without sign', () => {
    expect(formatPnL(0)).toBe('$0.00')
  })

  it('respects decimals option', () => {
    expect(formatPnL(1234.5678, { decimals: 0 })).toBe('+$1235')
    expect(formatPnL(1234.5678, { decimals: 4 })).toBe('+$1234.5678')
  })

  it('respects currencySymbol option', () => {
    expect(formatPnL(100, { currencySymbol: '€' })).toBe('+€100.00')
    expect(formatPnL(-100, { currencySymbol: '£' })).toBe('-£100.00')
  })

  it('respects showPlusSign option', () => {
    expect(formatPnL(100, { showPlusSign: false })).toBe('$100.00')
    expect(formatPnL(-100, { showPlusSign: false })).toBe('-$100.00')
  })

  it('handles very small numbers', () => {
    expect(formatPnL(0.001)).toBe('+$0.00')
    expect(formatPnL(0.001, { decimals: 3 })).toBe('+$0.001')
    expect(formatPnL(-0.001, { decimals: 3 })).toBe('-$0.001')
  })

  it('handles very large numbers', () => {
    expect(formatPnL(1_234_567.89)).toBe('+$1234567.89')
    expect(formatPnL(-9_876_543.21)).toBe('-$9876543.21')
  })

  it('handles NaN and Infinity', () => {
    expect(formatPnL(Number.NaN)).toBe('+$NaN')
    expect(formatPnL(Number.POSITIVE_INFINITY)).toBe('+$Infinity')
    expect(formatPnL(Number.NEGATIVE_INFINITY)).toBe('-$Infinity')
  })

  it('handles combination of all options', () => {
    expect(formatPnL(-1234.5678, { decimals: 4, currencySymbol: '€', showPlusSign: false })).toBe(
      '-€1234.5678'
    )
    expect(formatPnL(1234.5678, { decimals: 0, currencySymbol: '¥', showPlusSign: true })).toBe(
      '+¥1235'
    )
  })
})

describe('formatSignedPercentage', () => {
  it('formats positive percentages with plus sign', () => {
    expect(formatSignedPercentage(15.5)).toBe('+15.5%')
    expect(formatSignedPercentage(100)).toBe('+100.0%')
  })

  it('formats negative percentages with minus sign', () => {
    expect(formatSignedPercentage(-5.2)).toBe('-5.2%')
    expect(formatSignedPercentage(-100)).toBe('-100.0%')
  })

  it('formats zero without sign', () => {
    expect(formatSignedPercentage(0)).toBe('0.0%')
  })

  it('respects decimals option', () => {
    expect(formatSignedPercentage(15.567, { decimals: 0 })).toBe('+16%')
    expect(formatSignedPercentage(15.567, { decimals: 2 })).toBe('+15.57%')
  })

  it('respects showPlusSign option', () => {
    expect(formatSignedPercentage(15.5, { showPlusSign: false })).toBe('15.5%')
    expect(formatSignedPercentage(-5.2, { showPlusSign: false })).toBe('-5.2%')
  })

  it('respects percentSymbol option', () => {
    expect(formatSignedPercentage(15.5, { percentSymbol: ' pct' })).toBe('+15.5 pct')
    expect(formatSignedPercentage(-5.2, { percentSymbol: ' percent' })).toBe('-5.2 percent')
    expect(formatSignedPercentage(0, { percentSymbol: '‰' })).toBe('0.0‰')
  })

  it('handles very small percentages', () => {
    expect(formatSignedPercentage(0.01)).toBe('+0.0%')
    expect(formatSignedPercentage(0.01, { decimals: 2 })).toBe('+0.01%')
    expect(formatSignedPercentage(-0.001, { decimals: 3 })).toBe('-0.001%')
  })

  it('handles NaN and Infinity', () => {
    // NaN is not > 0, so no + sign is added
    expect(formatSignedPercentage(Number.NaN)).toBe('NaN%')
    expect(formatSignedPercentage(Number.POSITIVE_INFINITY)).toBe('+Infinity%')
    expect(formatSignedPercentage(Number.NEGATIVE_INFINITY)).toBe('-Infinity%')
  })

  it('handles combination of all options', () => {
    expect(
      formatSignedPercentage(-12.3456, { decimals: 3, percentSymbol: ' pp', showPlusSign: false })
    ).toBe('-12.346 pp')
    expect(
      formatSignedPercentage(99.99, { decimals: 0, percentSymbol: '%+', showPlusSign: true })
    ).toBe('+100%+')
  })
})

describe('formatPrice', () => {
  it('formats prices with currency symbol', () => {
    expect(formatPrice(1234.56)).toBe('$1234.56')
    expect(formatPrice(0)).toBe('$0.00')
  })

  it('respects decimals option', () => {
    expect(formatPrice(1234.567, { decimals: 0 })).toBe('$1235')
    expect(formatPrice(1234.567, { decimals: 3 })).toBe('$1234.567')
  })

  it('respects currencySymbol option', () => {
    expect(formatPrice(100, { currencySymbol: '€' })).toBe('€100.00')
  })

  it('handles negative prices (edge case)', () => {
    expect(formatPrice(-100)).toBe('$-100.00')
    expect(formatPrice(-1234.56)).toBe('$-1234.56')
  })

  it('handles very small prices', () => {
    expect(formatPrice(0.01)).toBe('$0.01')
    expect(formatPrice(0.001, { decimals: 3 })).toBe('$0.001')
  })

  it('handles NaN and Infinity', () => {
    expect(formatPrice(Number.NaN)).toBe('$NaN')
    expect(formatPrice(Number.POSITIVE_INFINITY)).toBe('$Infinity')
  })
})

describe('formatPriceOrFallback', () => {
  it('formats positive prices', () => {
    expect(formatPriceOrFallback(1234.56)).toBe('$1234.56')
    expect(formatPriceOrFallback(0.01)).toBe('$0.01')
  })

  it('returns fallback for zero', () => {
    expect(formatPriceOrFallback(0)).toBe('-')
    expect(formatPriceOrFallback(0, { fallback: 'N/A' })).toBe('N/A')
  })

  it('returns fallback for negative values', () => {
    expect(formatPriceOrFallback(-10)).toBe('-')
    expect(formatPriceOrFallback(-10, { fallback: 'Invalid' })).toBe('Invalid')
  })

  it('handles very small positive values', () => {
    expect(formatPriceOrFallback(0.001)).toBe('$0.00')
    expect(formatPriceOrFallback(0.001, { decimals: 3 })).toBe('$0.001')
  })

  it('handles NaN and Infinity', () => {
    // NaN <= 0 is false, so it goes through formatPrice
    expect(formatPriceOrFallback(Number.NaN)).toBe('$NaN')
    expect(formatPriceOrFallback(Number.POSITIVE_INFINITY)).toBe('$Infinity')
    // -Infinity <= 0 is true, so returns fallback
    expect(formatPriceOrFallback(Number.NEGATIVE_INFINITY)).toBe('-')
  })

  it('respects decimals and currencySymbol with fallback', () => {
    expect(formatPriceOrFallback(0, { decimals: 4, currencySymbol: '€', fallback: 'N/A' })).toBe(
      'N/A'
    )
    expect(formatPriceOrFallback(100, { decimals: 4, currencySymbol: '€', fallback: 'N/A' })).toBe(
      '€100.0000'
    )
  })
})

describe('formatQuantity', () => {
  it('formats positive quantities with separators', () => {
    expect(formatQuantity(1_234_567)).toBe('1,234,567')
    expect(formatQuantity(1000)).toBe('1,000')
  })

  it('returns fallback for zero', () => {
    expect(formatQuantity(0)).toBe('-')
    expect(formatQuantity(0, { fallback: 'N/A' })).toBe('N/A')
  })

  it('returns fallback for negative values', () => {
    expect(formatQuantity(-10)).toBe('-')
  })

  it('respects locale option', () => {
    expect(formatQuantity(1_234_567, { locale: 'de-DE' })).toBe('1.234.567')
  })

  it('handles fractional quantities', () => {
    expect(formatQuantity(1234.56)).toBe('1,234.56')
    expect(formatQuantity(0.5)).toBe('0.5')
    // toLocaleString does not round, it formats as-is
    expect(formatQuantity(999.999)).toBe('999.999')
  })

  it('handles very large quantities', () => {
    expect(formatQuantity(1_000_000_000)).toBe('1,000,000,000')
  })

  it('handles NaN and Infinity', () => {
    // NaN <= 0 is false, so it goes through toLocaleString
    expect(formatQuantity(Number.NaN)).toBe('NaN')
    // toLocaleString formats Infinity as ∞ symbol in en-US
    expect(formatQuantity(Number.POSITIVE_INFINITY)).toBe('∞')
    // -Infinity <= 0 is true, so returns fallback
    expect(formatQuantity(Number.NEGATIVE_INFINITY)).toBe('-')
  })
})

describe('formatPercentageOrFallback', () => {
  it('formats non-zero percentages', () => {
    expect(formatPercentageOrFallback(15.5)).toBe('15.50%')
    expect(formatPercentageOrFallback(0.1)).toBe('0.10%')
  })

  it('returns fallback for zero', () => {
    expect(formatPercentageOrFallback(0)).toBe('-')
    expect(formatPercentageOrFallback(0, { fallback: 'N/A' })).toBe('N/A')
  })

  it('respects decimals option', () => {
    expect(formatPercentageOrFallback(15.567, { decimals: 1 })).toBe('15.6%')
  })

  it('formats negative percentages without sign', () => {
    expect(formatPercentageOrFallback(-5.2)).toBe('-5.20%')
    expect(formatPercentageOrFallback(-100)).toBe('-100.00%')
    expect(formatPercentageOrFallback(-0.01, { decimals: 3 })).toBe('-0.010%')
  })

  it('respects percentSymbol option', () => {
    expect(formatPercentageOrFallback(15.5, { percentSymbol: ' percent' })).toBe('15.50 percent')
    expect(formatPercentageOrFallback(-5.2, { percentSymbol: '‰' })).toBe('-5.20‰')
  })

  it('handles very small percentages', () => {
    expect(formatPercentageOrFallback(0.001)).toBe('0.00%')
    expect(formatPercentageOrFallback(0.001, { decimals: 4 })).toBe('0.0010%')
  })

  it('handles NaN and Infinity', () => {
    expect(formatPercentageOrFallback(Number.NaN)).toBe('NaN%')
    expect(formatPercentageOrFallback(Number.POSITIVE_INFINITY)).toBe('Infinity%')
    expect(formatPercentageOrFallback(Number.NEGATIVE_INFINITY)).toBe('-Infinity%')
  })

  it('handles combination of options', () => {
    expect(
      formatPercentageOrFallback(-12.3456, { decimals: 3, percentSymbol: ' pp', fallback: 'N/A' })
    ).toBe('-12.346 pp')
    expect(
      formatPercentageOrFallback(0, { decimals: 1, percentSymbol: ' %', fallback: '--' })
    ).toBe('--')
  })
})

describe('getPnLColor', () => {
  it('returns teal for positive values', () => {
    expect(getPnLColor(100)).toBe('teal')
    expect(getPnLColor(0.01)).toBe('teal')
  })

  it('returns red for negative values', () => {
    expect(getPnLColor(-100)).toBe('red')
    expect(getPnLColor(-0.01)).toBe('red')
  })

  it('returns gray for zero', () => {
    expect(getPnLColor(0)).toBe('gray')
  })
})

describe('getPercentageChangeColor', () => {
  it('works same as getPnLColor', () => {
    expect(getPercentageChangeColor(5.5)).toBe('teal')
    expect(getPercentageChangeColor(-2.1)).toBe('red')
    expect(getPercentageChangeColor(0)).toBe('gray')
  })
})

describe('isProfitable', () => {
  it('returns true for positive values', () => {
    expect(isProfitable(100)).toBe(true)
    expect(isProfitable(0.01)).toBe(true)
  })

  it('returns false for negative values', () => {
    expect(isProfitable(-100)).toBe(false)
    expect(isProfitable(-0.01)).toBe(false)
  })

  it('returns false for zero', () => {
    expect(isProfitable(0)).toBe(false)
  })
})
