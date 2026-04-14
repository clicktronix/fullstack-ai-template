/**
 * Number formatting utilities.
 * Pure functions with no external dependencies.
 */

export type NumberFormatOptions = {
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

/**
 * Remove trailing zeros from a number string.
 * e.g., "3.00" -> "3", "3.50" -> "3.5", "3.25" -> "3.25"
 */
export function stripTrailingZeros(numStr: string): string {
  return Number.parseFloat(numStr).toString()
}

/**
 * Format a number as a ratio with fixed decimal places.
 */
export function formatRatio(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '\u2014'
  return value.toFixed(decimals)
}

/**
 * Format a number as a percentage.
 */
export function formatPercentage(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return '\u2014'
  return `${value.toFixed(decimals)}%`
}

/**
 * Format a number using locale-aware formatting.
 */
export function formatNumber(value: number, options: NumberFormatOptions = {}): string {
  const { locale = 'en-US', minimumFractionDigits, maximumFractionDigits } = options

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value)
}

/**
 * Format large numbers in compact notation (B/M/K).
 */
export function formatCompactNumber(value: number, locale = 'en-US'): string {
  if (!Number.isFinite(value)) return '\u2014'

  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (absValue >= 1e12) {
    return `${sign}${(absValue / 1e12).toFixed(1)}T`
  }
  if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(1)}B`
  }
  if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(1)}M`
  }
  if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(1)}K`
  }

  return `${sign}${absValue.toLocaleString(locale)}`
}

/**
 * Create a ratio formatter function.
 * Safe to use as valueFormatter in charts.
 */
export function createRatioFormatter(decimals = 2) {
  return (value: number): string => formatRatio(value, decimals)
}

/**
 * Create a percentage formatter function.
 * Safe to use as valueFormatter in charts.
 */
export function createPercentageFormatter(decimals = 1) {
  return (value: number): string => formatPercentage(value, decimals)
}

/**
 * Format number smartly - uses K/M/B/T suffixes for large numbers,
 * removes trailing zeros after decimal point.
 * Returns 'N/A' for null/undefined values.
 *
 * @example
 * formatNumberSmart(60.00) // "60"
 * formatNumberSmart(3000000) // "3M"
 * formatNumberSmart(60.50) // "60.5"
 * formatNumberSmart(null) // "N/A"
 */
export function formatNumberSmart(value: number | null | undefined, maxDecimals = 2): string {
  if (value === null || value === undefined) return 'N/A'
  if (!Number.isFinite(value)) return '\u2014'

  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  // Use K/M/B/T suffixes for large numbers
  if (absValue >= 1_000_000_000_000) {
    return `${sign}${stripTrailingZeros((absValue / 1_000_000_000_000).toFixed(maxDecimals))}T`
  }
  if (absValue >= 1_000_000_000) {
    return `${sign}${stripTrailingZeros((absValue / 1_000_000_000).toFixed(maxDecimals))}B`
  }
  if (absValue >= 1_000_000) {
    return `${sign}${stripTrailingZeros((absValue / 1_000_000).toFixed(maxDecimals))}M`
  }
  if (absValue >= 1000) {
    return `${sign}${stripTrailingZeros((absValue / 1000).toFixed(maxDecimals))}K`
  }

  // For small numbers, just remove trailing zeros
  return stripTrailingZeros(value.toFixed(maxDecimals))
}

/**
 * Format decimal with fixed precision (always shows specified decimals).
 *
 * @example
 * formatDecimal(3) // "3.00"
 * formatDecimal(3.5) // "3.50"
 */
export function formatDecimal(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '\u2014'
  return value.toFixed(decimals)
}

/**
 * Format percentage with null handling and trailing zero removal.
 * Returns 'N/A' for null/undefined values.
 *
 * @example
 * formatPercentageSmart(3.50) // "3.5%"
 * formatPercentageSmart(null) // "N/A"
 */
export function formatPercentageSmart(value: number | null | undefined, maxDecimals = 2): string {
  if (value === null || value === undefined) return 'N/A'
  if (!Number.isFinite(value)) return '\u2014'
  return `${stripTrailingZeros(value.toFixed(maxDecimals))}%`
}

/**
 * Convert decimal to percentage value (×100), preserving null.
 * Use this for data transformation before charting, not for display formatting.
 *
 * @example
 * toPercentage(0.15) // 15
 * toPercentage(null) // null
 */
export function toPercentage(value: number | null): number | null {
  return value === null ? null : value * 100
}
