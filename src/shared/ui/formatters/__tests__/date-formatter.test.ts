import { describe, expect, test } from 'bun:test'
import { getYearFromDate, formatStatementPeriod, comparePeriods } from '../date-formatter'

describe('getYearFromDate', () => {
  test('extracts year from ISO date string', () => {
    expect(getYearFromDate('2024-03-31')).toBe(2024)
    expect(getYearFromDate('2023-12-31')).toBe(2023)
    expect(getYearFromDate('2025-01-01')).toBe(2025)
  })

  test('handles different date formats', () => {
    expect(getYearFromDate('2024-06-15')).toBe(2024)
    expect(getYearFromDate('2024-1-1')).toBe(2024)
  })
})

describe('formatStatementPeriod', () => {
  describe('quarterly periods', () => {
    test('formats Q1 with year', () => {
      expect(formatStatementPeriod('2024-03-31', 'Q1')).toBe('Q1 2024')
    })

    test('formats Q2 with year', () => {
      expect(formatStatementPeriod('2024-06-30', 'Q2')).toBe('Q2 2024')
    })

    test('formats Q3 with year', () => {
      expect(formatStatementPeriod('2024-09-30', 'Q3')).toBe('Q3 2024')
    })

    test('formats Q4 with year', () => {
      expect(formatStatementPeriod('2024-12-31', 'Q4')).toBe('Q4 2024')
    })
  })

  describe('non-quarterly periods', () => {
    test('returns year only for FY period', () => {
      expect(formatStatementPeriod('2024-12-31', 'FY')).toBe('2024')
    })

    test('returns year only for annual period', () => {
      expect(formatStatementPeriod('2024-12-31', 'annual')).toBe('2024')
    })

    test('returns year only for null period', () => {
      expect(formatStatementPeriod('2024-06-30', null)).toBe('2024')
    })

    test('returns year only for undefined period', () => {
      expect(formatStatementPeriod('2024-06-30')).toBe('2024')
    })

    test('returns year only for empty string period', () => {
      expect(formatStatementPeriod('2024-06-30', '')).toBe('2024')
    })
  })

  describe('edge cases', () => {
    test('handles different years correctly', () => {
      expect(formatStatementPeriod('2020-03-31', 'Q1')).toBe('Q1 2020')
      expect(formatStatementPeriod('2030-03-31', 'Q1')).toBe('Q1 2030')
    })
  })
})

describe('comparePeriods', () => {
  describe('quarterly comparisons within same year', () => {
    test('Q1 < Q2', () => {
      expect(comparePeriods('Q1 2024', 'Q2 2024')).toBeLessThan(0)
    })

    test('Q2 < Q3', () => {
      expect(comparePeriods('Q2 2024', 'Q3 2024')).toBeLessThan(0)
    })

    test('Q3 < Q4', () => {
      expect(comparePeriods('Q3 2024', 'Q4 2024')).toBeLessThan(0)
    })

    test('Q4 > Q1', () => {
      expect(comparePeriods('Q4 2024', 'Q1 2024')).toBeGreaterThan(0)
    })

    test('same quarter equals zero', () => {
      expect(comparePeriods('Q2 2024', 'Q2 2024')).toBe(0)
    })
  })

  describe('quarterly comparisons across years', () => {
    test('Q4 2023 < Q1 2024', () => {
      expect(comparePeriods('Q4 2023', 'Q1 2024')).toBeLessThan(0)
    })

    test('Q1 2024 > Q4 2023', () => {
      expect(comparePeriods('Q1 2024', 'Q4 2023')).toBeGreaterThan(0)
    })

    test('Q1 2023 < Q1 2024', () => {
      expect(comparePeriods('Q1 2023', 'Q1 2024')).toBeLessThan(0)
    })
  })

  describe('year-only comparisons', () => {
    test('2023 < 2024', () => {
      expect(comparePeriods('2023', '2024')).toBeLessThan(0)
    })

    test('2024 > 2023', () => {
      expect(comparePeriods('2024', '2023')).toBeGreaterThan(0)
    })

    test('same year equals zero', () => {
      expect(comparePeriods('2024', '2024')).toBe(0)
    })
  })

  describe('mixed format comparisons', () => {
    test('year 2024 vs Q1 2024 (Jan 1 vs Jan 1)', () => {
      // Both resolve to January 1st of 2024
      expect(comparePeriods('2024', 'Q1 2024')).toBe(0)
    })

    test('year 2023 < Q1 2024', () => {
      expect(comparePeriods('2023', 'Q1 2024')).toBeLessThan(0)
    })
  })

  describe('fallback to string comparison', () => {
    test('invalid formats use localeCompare', () => {
      const result = comparePeriods('invalid-a', 'invalid-b')
      expect(result).toBe('invalid-a'.localeCompare('invalid-b'))
    })

    test('empty strings', () => {
      expect(comparePeriods('', '')).toBe(0)
    })
  })
})
