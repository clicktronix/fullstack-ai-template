/**
 * Price formatting utilities for Tenge (KZT) currency.
 * Locale-aware formatting with configurable options.
 */

export type PriceFormatOptions = {
  /** Locale for number formatting (default: 'ru-RU') */
  locale?: string
  /** Currency symbol to append (default: none) */
  currencySymbol?: string
  /** Fallback string for null values (default: '-') */
  fallback?: string
}

/**
 * Format price in Tenge with locale-aware thousands separator.
 * Uses non-breaking space as separator for ru-RU locale.
 *
 * @param price - The price value to format (can be null)
 * @param options - Formatting options
 * @returns Formatted price string or fallback for null values
 *
 * @example
 * formatPriceTenge(150000) // "150 000"
 * formatPriceTenge(150000, { locale: 'en-US' }) // "150,000"
 * formatPriceTenge(150000, { currencySymbol: ' tg' }) // "150 000 tg"
 * formatPriceTenge(null) // "-"
 */
export function formatPriceTenge(price: number | null, options: PriceFormatOptions = {}): string {
  const { locale = 'ru-RU', currencySymbol = '', fallback = '-' } = options

  if (price === null) {
    return fallback
  }

  const formatted = price.toLocaleString(locale)
  return currencySymbol ? `${formatted}${currencySymbol}` : formatted
}

/**
 * Format price with currency suffix (e.g., "150 000 tg").
 * Convenience wrapper for formatPriceTenge with currency symbol.
 *
 * @param price - The price value to format (can be null)
 * @param options - Formatting options (locale, fallback)
 * @returns Formatted price string with tenge suffix
 *
 * @example
 * formatPriceWithTengeSuffix(150000) // "150 000 tg"
 * formatPriceWithTengeSuffix(null) // "-"
 */
export function formatPriceWithTengeSuffix(
  price: number | null,
  options: Omit<PriceFormatOptions, 'currencySymbol'> = {}
): string {
  return formatPriceTenge(price, { ...options, currencySymbol: ' tg' })
}
