/**
 * Financial formatting utilities for P&L, prices, and market data.
 * Pure functions with no external dependencies.
 */

export type SignedNumberOptions = {
  /** Number of decimal places (default: 2) */
  decimals?: number
  /** Show sign for positive numbers (default: true) */
  showPlusSign?: boolean
  /** Currency symbol (default: '$') */
  currencySymbol?: string
  /** Percentage symbol (default: '%') */
  percentSymbol?: string
}

/**
 * Format a P&L (Profit/Loss) value with sign and currency symbol.
 * Positive values get '+' prefix, negative values get '-' prefix.
 *
 * @example
 * formatPnL(1234.56) // "+$1,234.56"
 * formatPnL(-1234.56) // "-$1,234.56"
 * formatPnL(0) // "$0.00"
 */
export function formatPnL(
  value: number,
  options: Pick<SignedNumberOptions, 'decimals' | 'currencySymbol' | 'showPlusSign'> = {}
): string {
  const { decimals = 2, currencySymbol = '$', showPlusSign = true } = options

  if (value === 0) {
    return `${currencySymbol}${value.toFixed(decimals)}`
  }

  if (value < 0) {
    return `-${currencySymbol}${Math.abs(value).toFixed(decimals)}`
  }

  const sign = showPlusSign ? '+' : ''
  return `${sign}${currencySymbol}${value.toFixed(decimals)}`
}

/**
 * Format a percentage with sign.
 * Positive values get '+' prefix, negative values get '-' prefix.
 *
 * @example
 * formatSignedPercentage(15.5) // "+15.5%"
 * formatSignedPercentage(-5.2) // "-5.2%"
 * formatSignedPercentage(0) // "0.0%"
 */
export function formatSignedPercentage(
  value: number,
  options: Pick<SignedNumberOptions, 'decimals' | 'percentSymbol' | 'showPlusSign'> = {}
): string {
  const { decimals = 1, percentSymbol = '%', showPlusSign = true } = options

  if (value === 0) {
    return `${value.toFixed(decimals)}${percentSymbol}`
  }

  const sign = value > 0 && showPlusSign ? '+' : ''
  return `${sign}${value.toFixed(decimals)}${percentSymbol}`
}

/**
 * Format a price with currency symbol.
 *
 * @example
 * formatPrice(1234.56) // "$1,234.56"
 * formatPrice(1234.56, { decimals: 0 }) // "$1,235"
 */
export function formatPrice(
  value: number,
  options: Pick<SignedNumberOptions, 'decimals' | 'currencySymbol'> = {}
): string {
  const { decimals = 2, currencySymbol = '$' } = options
  return `${currencySymbol}${value.toFixed(decimals)}`
}

/**
 * Format a price with fallback for zero/negative values.
 * Returns fallback string if value is <= 0.
 *
 * @example
 * formatPriceOrFallback(1234.56) // "$1,234.56"
 * formatPriceOrFallback(0) // "-"
 * formatPriceOrFallback(-10) // "-"
 * formatPriceOrFallback(0, { fallback: 'N/A' }) // "N/A"
 */
export function formatPriceOrFallback(
  value: number,
  options: Pick<SignedNumberOptions, 'decimals' | 'currencySymbol'> & {
    fallback?: string
  } = {}
): string {
  const { fallback = '-', ...formatOptions } = options

  if (value <= 0) {
    return fallback
  }

  return formatPrice(value, formatOptions)
}

/**
 * Get color name for P&L value.
 * Returns 'teal' for positive, 'red' for negative, 'gray' for zero.
 *
 * @example
 * getPnLColor(100) // 'teal'
 * getPnLColor(-50) // 'red'
 * getPnLColor(0) // 'gray'
 */
export function getPnLColor(value: number): 'teal' | 'red' | 'gray' {
  if (value > 0) return 'teal'
  if (value < 0) return 'red'
  return 'gray'
}

/**
 * Get color for percentage change.
 * Alias for getPnLColor for semantic clarity.
 *
 * @example
 * getPercentageChangeColor(5.5) // 'teal'
 * getPercentageChangeColor(-2.1) // 'red'
 */
export function getPercentageChangeColor(value: number): 'teal' | 'red' | 'gray' {
  return getPnLColor(value)
}

/**
 * Check if a value is profitable (positive).
 *
 * @example
 * isProfitable(100) // true
 * isProfitable(-50) // false
 * isProfitable(0) // false
 */
export function isProfitable(value: number): boolean {
  return value > 0
}

/**
 * Format quantity with locale-aware separators.
 * Returns fallback string if value is <= 0.
 *
 * @example
 * formatQuantity(1234567) // "1,234,567"
 * formatQuantity(0) // "-"
 * formatQuantity(-10) // "-"
 */
export function formatQuantity(
  value: number,
  options: { locale?: string; fallback?: string } = {}
): string {
  const { locale = 'en-US', fallback = '-' } = options

  if (value <= 0) {
    return fallback
  }

  return value.toLocaleString(locale)
}

/**
 * Format percentage with fallback for zero values.
 *
 * @example
 * formatPercentageOrFallback(15.5) // "15.5%"
 * formatPercentageOrFallback(0) // "-"
 * formatPercentageOrFallback(0, { fallback: 'N/A' }) // "N/A"
 */
export function formatPercentageOrFallback(
  value: number,
  options: Pick<SignedNumberOptions, 'decimals' | 'percentSymbol'> & {
    fallback?: string
  } = {}
): string {
  const { decimals = 2, percentSymbol = '%', fallback = '-' } = options

  if (value === 0) {
    return fallback
  }

  return `${value.toFixed(decimals)}${percentSymbol}`
}
