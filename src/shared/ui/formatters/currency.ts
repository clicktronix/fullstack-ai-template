/**
 * Currency formatting utilities using Intl.NumberFormat.
 * Pure functions with no external dependencies.
 */

export type CurrencyFormatOptions = {
  currency?: string
  locale?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

/**
 * Format a number as currency using Intl.NumberFormat.
 *
 * @param value - The numeric value to format
 * @param options - Formatting options
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(1234.56, { currency: 'EUR', locale: 'de-DE' }) // "1.234,56 €"
 */
export function formatCurrency(value: number, options: CurrencyFormatOptions = {}): string {
  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options

  // Ensure min <= max to prevent RangeError
  const clampedMin = Math.min(minimumFractionDigits, maximumFractionDigits)

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: clampedMin,
    maximumFractionDigits,
  }).format(value)
}

/**
 * Get currency symbol for a given currency code.
 */
function getCurrencySymbol(currency: string, locale: string): string {
  return (
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
    })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value ?? '$'
  )
}

/**
 * Remove trailing zeros from a number string.
 */
function stripTrailingZeros(numStr: string): string {
  return Number.parseFloat(numStr).toString()
}

/**
 * Format large numbers in compact notation (B/M/K) with currency symbol.
 * Used for compact dashboards and data visualizations.
 *
 * @param value - The numeric value to format
 * @param options - Formatting options (currency, locale, maxDecimals)
 * @returns Formatted compact currency string
 *
 * @example
 * formatCompactCurrency(1500000000) // "$1.5B"
 * formatCompactCurrency(2500000, { currency: 'EUR' }) // "€2.5M"
 * formatCompactCurrency(1500000, { maxDecimals: 2 }) // "$1.5M"
 */
export function formatCompactCurrency(
  value: number,
  options: Pick<CurrencyFormatOptions, 'currency' | 'locale'> & { maxDecimals?: number } = {}
): string {
  const { currency = 'USD', locale = 'en-US', maxDecimals = 1 } = options
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  const currencySymbol = getCurrencySymbol(currency, locale)

  if (absValue >= 1e12) {
    return `${sign}${currencySymbol}${stripTrailingZeros((absValue / 1e12).toFixed(maxDecimals))}T`
  }
  if (absValue >= 1e9) {
    return `${sign}${currencySymbol}${stripTrailingZeros((absValue / 1e9).toFixed(maxDecimals))}B`
  }
  if (absValue >= 1e6) {
    return `${sign}${currencySymbol}${stripTrailingZeros((absValue / 1e6).toFixed(maxDecimals))}M`
  }
  if (absValue >= 1e3) {
    return `${sign}${currencySymbol}${stripTrailingZeros((absValue / 1e3).toFixed(maxDecimals))}K`
  }

  return `${sign}${currencySymbol}${absValue.toLocaleString(locale)}`
}

/**
 * Create a currency formatter function with preset options.
 * Safe to use as valueFormatter in charts (only takes value as argument).
 *
 * @param options - Currency and locale options
 * @returns A function that formats a number as compact currency
 *
 * @example
 * const formatter = createCompactCurrencyFormatter({ currency: 'USD' })
 * formatter(1500000) // "$1.5M"
 */
export function createCompactCurrencyFormatter(
  options: Pick<CurrencyFormatOptions, 'currency' | 'locale'> = {}
) {
  return (value: number): string => formatCompactCurrency(value, options)
}

/**
 * Create a standard currency formatter function with preset options.
 *
 * @param options - Formatting options
 * @returns A function that formats a number as currency
 */
export function createCurrencyFormatter(options: CurrencyFormatOptions = {}) {
  return (value: number): string => formatCurrency(value, options)
}

/**
 * Format currency with smart suffix (K/M/B/T) and null handling.
 * Returns 'N/A' for null/undefined values.
 *
 * @example
 * formatCurrencySmart(1500000) // "$1.5M"
 * formatCurrencySmart(1500000, 2) // "$1.5M"
 * formatCurrencySmart(null) // "N/A"
 */
export function formatCurrencySmart(
  value: number | null | undefined,
  maxDecimals = 1,
  options: Pick<CurrencyFormatOptions, 'currency' | 'locale'> = {}
): string {
  if (value === null || value === undefined) return 'N/A'
  return formatCompactCurrency(value, { ...options, maxDecimals })
}

/**
 * Format currency with null handling.
 * Returns 'N/A' for null/undefined values.
 * Simple USD formatting with null handling.
 *
 * @example
 * formatCurrencyNullable(1234.56) // "$1,234.56"
 * formatCurrencyNullable(null) // "N/A"
 */
export function formatCurrencyNullable(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined) return 'N/A'
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}
