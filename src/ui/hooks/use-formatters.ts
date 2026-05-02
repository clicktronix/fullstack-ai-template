'use client'

import { useMemo } from 'react'
import {
  formatCurrency,
  formatCompactCurrency,
  type CurrencyFormatOptions,
} from '@/lib/formatters/currency'
import {
  formatNumber,
  formatCompactNumber,
  formatRatio,
  formatPercentage,
  type NumberFormatOptions,
} from '@/lib/formatters/number'
import { useLocale, type Locale } from '@/ui/providers/LocaleContext'

/**
 * Map short locale codes to full locale strings for Intl.
 */
const LOCALE_MAP: Record<Locale, string> = {
  en: 'en-US',
}

/**
 * Default currency for currency formatting.
 * Currency is independent from locale - it's determined by the data source.
 */
const DEFAULT_CURRENCY = 'USD'

export type UseFormattersOptions = {
  /** Override the default currency for the locale */
  currency?: string
}

/**
 * Hook that provides locale-aware formatting functions.
 * Uses the current locale from context to format numbers and currencies.
 *
 * @example
 * function PriceDisplay({ value }: { value: number }) {
 *   const { currency, compactCurrency } = useFormatters()
 *   return <Text>{currency(value)}</Text>
 * }
 *
 * @example
 * // For data visualization valueFormatter (returns a function safe to use)
 * function MetricsChart() {
 *   const { compactCurrencyFormatter } = useFormatters()
 *   return <BarChart valueFormatter={compactCurrencyFormatter} />
 * }
 */
export function useFormatters(options: UseFormattersOptions = {}) {
  const { locale: shortLocale } = useLocale()

  const locale = LOCALE_MAP[shortLocale]
  const currency = options.currency ?? DEFAULT_CURRENCY

  // Memoized formatting functions
  const formatters = useMemo(
    () => ({
      /**
       * Format a number as currency.
       * @example currency(1234.56) // "$1,234.56"
       */
      currency: (value: number, opts?: Omit<CurrencyFormatOptions, 'locale' | 'currency'>) =>
        formatCurrency(value, { locale, currency, ...opts }),

      /**
       * Format a number as compact currency (B/M/K).
       * @example compactCurrency(1500000000) // "$1.5B"
       */
      compactCurrency: (value: number) => formatCompactCurrency(value, { locale, currency }),

      /**
       * Format a number with locale-aware separators.
       * @example number(1234567.89) // "1,234,567.89"
       */
      number: (value: number, opts?: Omit<NumberFormatOptions, 'locale'>) =>
        formatNumber(value, { locale, ...opts }),

      /**
       * Format a number in compact notation (B/M/K).
       * @example compactNumber(1500000) // "1.5M"
       */
      compactNumber: (value: number) => formatCompactNumber(value, locale),

      /**
       * Format a number as a ratio with fixed decimals.
       * @example ratio(1.234) // "1.23"
       */
      ratio: (value: number, decimals?: number) => formatRatio(value, decimals),

      /**
       * Format a number as a percentage.
       * @example percentage(15.5) // "15.5%"
       */
      percentage: (value: number, decimals?: number) => formatPercentage(value, decimals),
    }),
    [locale, currency]
  )

  return {
    ...formatters,
    /** Current locale string (e.g., 'en-US') */
    locale,
    /** Current currency code (e.g., 'USD') */
    currencyCode: currency,
    /** Stable function for visualization valueFormatter (compact currency) */
    compactCurrencyFormatter: formatters.compactCurrency,
    /** Stable function for visualization valueFormatter (ratio) */
    ratioFormatter: formatRatio,
    /** Stable function for visualization valueFormatter (percentage) */
    percentageFormatter: formatPercentage,
  }
}
