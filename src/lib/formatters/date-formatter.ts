/**
 * Date formatting utilities.
 * Centralized dayjs usage for date operations.
 */

import dayjs from '@/lib/dayjs'

/**
 * Extract year from ISO date string.
 * @param date - ISO date string (e.g., "2024-03-31")
 * @returns Year number
 */
export function getYearFromDate(date: string): number {
  return dayjs(date).year()
}

/**
 * Format a reporting date and period into a display label.
 * @param date - ISO date string (e.g., "2024-03-31")
 * @param period - Optional period label (e.g., "Q1", "FY")
 * @returns Formatted period string (e.g., "Q1 2024" or "2024")
 */
export function formatStatementPeriod(date: string, period?: string | null): string {
  const year = getYearFromDate(date)
  // Only include quarter prefix (Q1, Q2, etc.), skip FY/annual
  if (period && period.startsWith('Q')) {
    return `${period} ${year}`
  }
  return String(year)
}

/**
 * Convert period label to a timestamp for comparison.
 * Q1 = January 1, Q2 = April 1, Q3 = July 1, Q4 = October 1
 * @returns Timestamp in milliseconds or null if invalid format
 */
function periodToTimestamp(period: string): number | null {
  // Try "Q1 2024" format
  const quarterMatch = period.match(/Q(\d)\s+(\d{4})/)
  if (quarterMatch) {
    const quarter = Number.parseInt(quarterMatch[1], 10)
    const year = Number.parseInt(quarterMatch[2], 10)
    // Quarter to month: Q1=0, Q2=3, Q3=6, Q4=9
    const month = (quarter - 1) * 3
    return dayjs().year(year).month(month).date(1).startOf('day').valueOf()
  }

  // Try year-only format "2024"
  const yearMatch = period.match(/^(\d{4})$/)
  if (yearMatch) {
    const year = Number.parseInt(yearMatch[1], 10)
    return dayjs().year(year).month(0).date(1).startOf('day').valueOf()
  }

  return null
}

/**
 * Compare two period labels for chronological sorting.
 * Handles "Q1 2024" format and plain year format "2024".
 * @returns negative if a < b, positive if a > b, 0 if equal
 */
export function comparePeriods(periodA: string, periodB: string): number {
  const timestampA = periodToTimestamp(periodA)
  const timestampB = periodToTimestamp(periodB)

  if (timestampA !== null && timestampB !== null) {
    return timestampA - timestampB
  }

  // Fallback: string comparison
  return periodA.localeCompare(periodB)
}
