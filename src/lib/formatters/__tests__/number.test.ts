import { describe, expect, test } from 'bun:test'
import {
  formatRatio,
  formatPercentage,
  formatNumber,
  formatCompactNumber,
  createRatioFormatter,
  createPercentageFormatter,
  formatNumberSmart,
  formatDecimal,
  formatPercentageSmart,
} from '../number'

describe('formatRatio', () => {
  test('formats with default 2 decimals', () => {
    expect(formatRatio(1.2345)).toBe('1.23')
    expect(formatRatio(0.5)).toBe('0.50')
  })

  test('formats with custom decimals', () => {
    expect(formatRatio(1.234_56, 3)).toBe('1.235')
    expect(formatRatio(1.234_56, 0)).toBe('1')
    expect(formatRatio(1.234_56, 4)).toBe('1.2346')
  })

  test('handles negative numbers', () => {
    expect(formatRatio(-1.2345)).toBe('-1.23')
  })

  test('handles zero', () => {
    expect(formatRatio(0)).toBe('0.00')
  })

  test('handles large numbers', () => {
    expect(formatRatio(1234.5678)).toBe('1234.57')
  })
})

describe('formatPercentage', () => {
  test('formats with default 1 decimal', () => {
    expect(formatPercentage(12.34)).toBe('12.3%')
    expect(formatPercentage(5)).toBe('5.0%')
  })

  test('formats with custom decimals', () => {
    expect(formatPercentage(12.345, 2)).toBe('12.35%')
    expect(formatPercentage(12.345, 0)).toBe('12%')
  })

  test('handles negative percentages', () => {
    expect(formatPercentage(-5.5)).toBe('-5.5%')
  })

  test('handles zero', () => {
    expect(formatPercentage(0)).toBe('0.0%')
  })

  test('handles large percentages', () => {
    expect(formatPercentage(150.5)).toBe('150.5%')
  })
})

describe('formatNumber', () => {
  test('formats with default locale', () => {
    expect(formatNumber(1_234_567)).toBe('1,234,567')
  })

  test('formats with custom fraction digits', () => {
    expect(formatNumber(1234.5678, { minimumFractionDigits: 2, maximumFractionDigits: 2 })).toBe(
      '1,234.57'
    )
  })

  test('formats with German locale', () => {
    const result = formatNumber(1234.56, {
      locale: 'de-DE',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    // German uses comma for decimals
    expect(result).toBe('1.234,56')
  })

  test('handles negative numbers', () => {
    expect(formatNumber(-1_234_567)).toBe('-1,234,567')
  })

  test('handles zero', () => {
    expect(formatNumber(0)).toBe('0')
  })
})

describe('formatCompactNumber', () => {
  describe('scale formatting', () => {
    test('formats trillions', () => {
      expect(formatCompactNumber(1_500_000_000_000)).toBe('1.5T')
      expect(formatCompactNumber(2_000_000_000_000)).toBe('2.0T')
    })

    test('formats billions', () => {
      expect(formatCompactNumber(1_500_000_000)).toBe('1.5B')
      expect(formatCompactNumber(1_000_000_000)).toBe('1.0B')
    })

    test('formats millions', () => {
      expect(formatCompactNumber(2_500_000)).toBe('2.5M')
      expect(formatCompactNumber(1_000_000)).toBe('1.0M')
    })

    test('formats thousands', () => {
      expect(formatCompactNumber(5500)).toBe('5.5K')
      expect(formatCompactNumber(1000)).toBe('1.0K')
    })

    test('formats small numbers', () => {
      expect(formatCompactNumber(500)).toBe('500')
      expect(formatCompactNumber(99)).toBe('99')
    })
  })

  describe('negative values', () => {
    test('formats negative trillions', () => {
      expect(formatCompactNumber(-1_500_000_000_000)).toBe('-1.5T')
    })

    test('formats negative billions', () => {
      expect(formatCompactNumber(-1_500_000_000)).toBe('-1.5B')
    })

    test('formats negative millions', () => {
      expect(formatCompactNumber(-2_500_000)).toBe('-2.5M')
    })

    test('formats negative thousands', () => {
      expect(formatCompactNumber(-5500)).toBe('-5.5K')
    })
  })

  test('formats zero', () => {
    expect(formatCompactNumber(0)).toBe('0')
  })
})

describe('createRatioFormatter', () => {
  test('creates formatter with default decimals', () => {
    const formatter = createRatioFormatter()
    expect(formatter(1.2345)).toBe('1.23')
  })

  test('creates formatter with custom decimals', () => {
    const formatter = createRatioFormatter(3)
    // toFixed uses IEEE 754 rounding
    expect(formatter(1.2346)).toBe('1.235')
  })

  test('formatter can be reused', () => {
    const formatter = createRatioFormatter()
    expect(formatter(1.11)).toBe('1.11')
    expect(formatter(2.22)).toBe('2.22')
  })
})

describe('createPercentageFormatter', () => {
  test('creates formatter with default decimals', () => {
    const formatter = createPercentageFormatter()
    expect(formatter(12.34)).toBe('12.3%')
  })

  test('creates formatter with custom decimals', () => {
    const formatter = createPercentageFormatter(2)
    expect(formatter(12.345)).toBe('12.35%')
  })

  test('formatter can be reused', () => {
    const formatter = createPercentageFormatter()
    expect(formatter(10)).toBe('10.0%')
    expect(formatter(20)).toBe('20.0%')
  })
})

describe('formatNumberSmart', () => {
  describe('null/undefined handling', () => {
    test('returns N/A for null', () => {
      expect(formatNumberSmart(null)).toBe('N/A')
    })

    test('returns N/A for undefined', () => {
      expect(formatNumberSmart(undefined)).toBe('N/A')
    })
  })

  describe('suffix formatting', () => {
    test('formats trillions with T suffix', () => {
      expect(formatNumberSmart(1_500_000_000_000)).toBe('1.5T')
      expect(formatNumberSmart(2_000_000_000_000)).toBe('2T')
    })

    test('formats billions with B suffix', () => {
      expect(formatNumberSmart(1_500_000_000)).toBe('1.5B')
      expect(formatNumberSmart(1_000_000_000)).toBe('1B')
    })

    test('formats millions with M suffix', () => {
      expect(formatNumberSmart(2_500_000)).toBe('2.5M')
      expect(formatNumberSmart(1_000_000)).toBe('1M')
    })

    test('formats thousands with K suffix', () => {
      expect(formatNumberSmart(5500)).toBe('5.5K')
      expect(formatNumberSmart(1000)).toBe('1K')
    })
  })

  describe('small numbers', () => {
    test('formats small numbers without suffix', () => {
      expect(formatNumberSmart(500)).toBe('500')
      expect(formatNumberSmart(99)).toBe('99')
    })

    test('removes trailing zeros', () => {
      expect(formatNumberSmart(60)).toBe('60')
      expect(formatNumberSmart(60.5)).toBe('60.5')
      expect(formatNumberSmart(3.25)).toBe('3.25')
    })
  })

  describe('negative values', () => {
    test('formats negative trillions', () => {
      expect(formatNumberSmart(-1_500_000_000_000)).toBe('-1.5T')
    })

    test('formats negative billions', () => {
      expect(formatNumberSmart(-1_500_000_000)).toBe('-1.5B')
    })

    test('formats negative millions', () => {
      expect(formatNumberSmart(-2_500_000)).toBe('-2.5M')
    })

    test('formats negative thousands', () => {
      expect(formatNumberSmart(-5500)).toBe('-5.5K')
    })

    test('formats negative small numbers', () => {
      expect(formatNumberSmart(-50)).toBe('-50')
    })
  })

  describe('custom decimals', () => {
    test('respects maxDecimals parameter for small numbers', () => {
      expect(formatNumberSmart(123.5678, 3)).toBe('123.568')
      expect(formatNumberSmart(123.5678, 0)).toBe('124')
    })

    test('respects maxDecimals parameter for large numbers', () => {
      expect(formatNumberSmart(1_234_567, 3)).toBe('1.235M')
      expect(formatNumberSmart(1_234_567, 0)).toBe('1M')
    })
  })

  test('handles zero', () => {
    expect(formatNumberSmart(0)).toBe('0')
  })
})

describe('formatDecimal', () => {
  test('formats with default 2 decimals', () => {
    expect(formatDecimal(3)).toBe('3.00')
    expect(formatDecimal(3.5)).toBe('3.50')
    expect(formatDecimal(3.25)).toBe('3.25')
  })

  test('formats with custom decimals', () => {
    expect(formatDecimal(3.141_59, 4)).toBe('3.1416')
    expect(formatDecimal(3.141_59, 0)).toBe('3')
    expect(formatDecimal(3.141_59, 1)).toBe('3.1')
  })

  test('handles negative numbers', () => {
    expect(formatDecimal(-3.5)).toBe('-3.50')
  })

  test('handles zero', () => {
    expect(formatDecimal(0)).toBe('0.00')
  })

  test('handles large numbers', () => {
    expect(formatDecimal(1_234_567.89)).toBe('1234567.89')
  })
})

describe('formatPercentageSmart', () => {
  describe('null/undefined handling', () => {
    test('returns N/A for null', () => {
      expect(formatPercentageSmart(null)).toBe('N/A')
    })

    test('returns N/A for undefined', () => {
      expect(formatPercentageSmart(undefined)).toBe('N/A')
    })
  })

  describe('trailing zero removal', () => {
    test('removes trailing zeros', () => {
      expect(formatPercentageSmart(3.5)).toBe('3.5%')
      expect(formatPercentageSmart(3)).toBe('3%')
      expect(formatPercentageSmart(3.25)).toBe('3.25%')
    })
  })

  describe('custom decimals', () => {
    test('respects maxDecimals parameter', () => {
      expect(formatPercentageSmart(3.141_59, 3)).toBe('3.142%')
      expect(formatPercentageSmart(3.141_59, 0)).toBe('3%')
    })
  })

  test('handles negative percentages', () => {
    expect(formatPercentageSmart(-5.5)).toBe('-5.5%')
  })

  test('handles zero', () => {
    expect(formatPercentageSmart(0)).toBe('0%')
  })

  test('handles large percentages', () => {
    expect(formatPercentageSmart(150.5)).toBe('150.5%')
  })
})
