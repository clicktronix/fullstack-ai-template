/**
 * Content formatting utilities for streamed assistant content.
 * Pure functions with no external dependencies.
 */

// Regex to match chart placeholders: [[CHART:<id>:<type>]]
// Notes:
// - Backend chart IDs are not guaranteed to be UUIDs (could be "chart-1", etc.)
// - Chart type could include digits or hyphens depending on backend conventions
const CHART_PLACEHOLDER_REGEX_GLOBAL = /\[\[CHART:([^\]:]+):([a-z0-9_-]+)\]\]/gi
const CHART_PLACEHOLDER_REGEX_TEST = /\[\[CHART:[^\]:]+:[a-z0-9_-]+\]\]/i

/**
 * Strip chart placeholders from content for display.
 * Charts are rendered separately from the text content.
 *
 * @example
 * replaceChartPlaceholders("Analysis: [[CHART:abc-123:revenue_profit_trends]]")
 * // Returns: "Analysis:"
 */
export function replaceChartPlaceholders(content: string): string {
  return content.replaceAll(CHART_PLACEHOLDER_REGEX_GLOBAL, '').trim()
}

/**
 * Check if content contains chart placeholders.
 */
export function hasChartPlaceholders(content: string): boolean {
  // Use a non-global regex to avoid lastIndex state leakage across calls.
  return CHART_PLACEHOLDER_REGEX_TEST.test(content)
}

/**
 * Extract chart IDs from content placeholders.
 *
 * @example
 * extractChartIds("Text [[CHART:abc-123:revenue_profit_trends]] more text")
 * // Returns: ["abc-123"]
 */
export function extractChartIds(content: string): string[] {
  const matches = content.matchAll(/\[\[CHART:([^\]:]+):[a-z0-9_-]+\]\]/gi)
  return [...matches].map((match) => match[1])
}

/**
 * Content segment types for inline rendering.
 * All segments have unique `id` for React keys (based on position).
 * ChartSegment has separate `chartId` for data lookup in chartsMap.
 */
export type TextSegment = { type: 'text'; id: string; content: string }
export type ChartSegment = { type: 'chart'; id: string; chartId: string; chartType: string }
export type ContentSegment = TextSegment | ChartSegment

/**
 * Parse content into segments for inline chart rendering.
 * Splits text by chart placeholders and returns ordered segments.
 *
 * @example
 * parseContentSegments("Analysis: [[CHART:abc-123:revenue]] More text")
 * // Returns: [
 * //   { type: 'text', content: 'Analysis: ' },
 * //   { type: 'chart', id: 'abc-123', chartType: 'revenue' },
 * //   { type: 'text', content: ' More text' }
 * // ]
 */
export function parseContentSegments(content: string): ContentSegment[] {
  const segments: ContentSegment[] = []
  const regex = /\[\[CHART:([^\]:]+):([a-z0-9_-]+)\]\]/gi
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    // Add text before placeholder (id = character position for uniqueness)
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index)
      if (text) segments.push({ type: 'text', id: `text-${lastIndex}`, content: text })
    }

    // Add chart placeholder (id = position for React key, chartId = UUID for data lookup)
    segments.push({
      type: 'chart',
      id: `chart-${match.index}`,
      chartId: match[1],
      chartType: match[2],
    })
    lastIndex = regex.lastIndex
  }

  // Add remaining text after last placeholder
  if (lastIndex < content.length) {
    const text = content.slice(lastIndex)
    if (text) segments.push({ type: 'text', id: `text-${lastIndex}`, content: text })
  }

  return segments
}
