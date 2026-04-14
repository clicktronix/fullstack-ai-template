import { describe, expect, test } from 'bun:test'
import {
  parseContentSegments,
  replaceChartPlaceholders,
  hasChartPlaceholders,
  extractChartIds,
} from '../content'

describe('parseContentSegments', () => {
  test('single chart with surrounding text', () => {
    const content = 'Analysis: [[CHART:abc-123:revenue]] More text'
    const result = parseContentSegments(content)

    expect(result).toEqual([
      { type: 'text', id: 'text-0', content: 'Analysis: ' },
      { type: 'chart', id: 'chart-10', chartId: 'abc-123', chartType: 'revenue' },
      { type: 'text', id: 'text-35', content: ' More text' },
    ])
  })

  test('multiple charts with text between them', () => {
    const content =
      'First: [[CHART:aaa-111:revenue_profit_trends]] Middle text [[CHART:bbb-222:expenses]] End'
    const result = parseContentSegments(content)

    expect(result).toEqual([
      { type: 'text', id: 'text-0', content: 'First: ' },
      { type: 'chart', id: 'chart-7', chartId: 'aaa-111', chartType: 'revenue_profit_trends' },
      { type: 'text', id: 'text-46', content: ' Middle text ' },
      { type: 'chart', id: 'chart-59', chartId: 'bbb-222', chartType: 'expenses' },
      { type: 'text', id: 'text-85', content: ' End' },
    ])
  })

  test('multiple charts back-to-back (no text between)', () => {
    const content = '[[CHART:aaa-111:revenue]][[CHART:bbb-222:expenses]][[CHART:ccc-333:ratios]]'
    const result = parseContentSegments(content)

    expect(result).toEqual([
      { type: 'chart', id: 'chart-0', chartId: 'aaa-111', chartType: 'revenue' },
      { type: 'chart', id: 'chart-25', chartId: 'bbb-222', chartType: 'expenses' },
      { type: 'chart', id: 'chart-51', chartId: 'ccc-333', chartType: 'ratios' },
    ])
  })

  test('chart at the beginning', () => {
    const content = '[[CHART:abc-123:revenue]] followed by text'
    const result = parseContentSegments(content)

    expect(result).toEqual([
      { type: 'chart', id: 'chart-0', chartId: 'abc-123', chartType: 'revenue' },
      { type: 'text', id: 'text-25', content: ' followed by text' },
    ])
  })

  test('chart at the end', () => {
    const content = 'Text before [[CHART:abc-123:revenue]]'
    const result = parseContentSegments(content)

    expect(result).toEqual([
      { type: 'text', id: 'text-0', content: 'Text before ' },
      { type: 'chart', id: 'chart-12', chartId: 'abc-123', chartType: 'revenue' },
    ])
  })

  test('only text, no charts', () => {
    const content = 'Just some plain text without any charts'
    const result = parseContentSegments(content)

    expect(result).toEqual([
      { type: 'text', id: 'text-0', content: 'Just some plain text without any charts' },
    ])
  })

  test('empty string', () => {
    const result = parseContentSegments('')
    expect(result).toEqual([])
  })

  test('only a single chart', () => {
    const content = '[[CHART:abc-123:revenue]]'
    const result = parseContentSegments(content)

    expect(result).toEqual([
      { type: 'chart', id: 'chart-0', chartId: 'abc-123', chartType: 'revenue' },
    ])
  })

  test('charts with newlines between them', () => {
    const content =
      'Intro\n\n[[CHART:aaa-111:revenue]]\n\nMiddle\n\n[[CHART:bbb-222:expenses]]\n\nEnd'
    const result = parseContentSegments(content)

    expect(result).toEqual([
      { type: 'text', id: 'text-0', content: 'Intro\n\n' },
      { type: 'chart', id: 'chart-7', chartId: 'aaa-111', chartType: 'revenue' },
      { type: 'text', id: 'text-32', content: '\n\nMiddle\n\n' },
      { type: 'chart', id: 'chart-42', chartId: 'bbb-222', chartType: 'expenses' },
      { type: 'text', id: 'text-68', content: '\n\nEnd' },
    ])
  })

  test('real-world UUID format', () => {
    const content =
      'Here is your analysis: [[CHART:550e8400-e29b-41d4-a716-446655440000:revenue_profit_trends]]'
    const result = parseContentSegments(content)

    expect(result).toEqual([
      { type: 'text', id: 'text-0', content: 'Here is your analysis: ' },
      {
        type: 'chart',
        id: 'chart-23',
        chartId: '550e8400-e29b-41d4-a716-446655440000',
        chartType: 'revenue_profit_trends',
      },
    ])
  })

  test('same chart referenced twice gets unique ids', () => {
    const content = '[[CHART:abc-123:revenue]] text [[CHART:abc-123:revenue]]'
    const result = parseContentSegments(content)

    expect(result).toEqual([
      { type: 'chart', id: 'chart-0', chartId: 'abc-123', chartType: 'revenue' },
      { type: 'text', id: 'text-25', content: ' text ' },
      { type: 'chart', id: 'chart-31', chartId: 'abc-123', chartType: 'revenue' },
    ])
    // Same chartId but different id for React keys
    expect(result[0].id).not.toBe(result[2].id)
  })

  test('non-UUID chart ids are supported', () => {
    const content = 'Chart here: [[CHART:chart-1:revenue_profit_trends]]'
    const result = parseContentSegments(content)

    expect(result).toEqual([
      { type: 'text', id: 'text-0', content: 'Chart here: ' },
      { type: 'chart', id: 'chart-12', chartId: 'chart-1', chartType: 'revenue_profit_trends' },
    ])
  })

  test('chart types with hyphens are supported', () => {
    const content = '[[CHART:abc-123:revenue-profit-trends]]'
    const result = parseContentSegments(content)

    expect(result).toEqual([
      { type: 'chart', id: 'chart-0', chartId: 'abc-123', chartType: 'revenue-profit-trends' },
    ])
  })
})

describe('replaceChartPlaceholders', () => {
  test('removes single placeholder', () => {
    const result = replaceChartPlaceholders('Text [[CHART:abc-123:revenue]] more')
    expect(result).toBe('Text  more')
  })

  test('removes multiple placeholders', () => {
    const result = replaceChartPlaceholders('[[CHART:a:x]][[CHART:b:y]]')
    expect(result).toBe('')
  })
})

describe('hasChartPlaceholders', () => {
  test('returns true when placeholder exists', () => {
    expect(hasChartPlaceholders('Text [[CHART:abc-123:revenue]]')).toBe(true)
  })

  test('returns false when no placeholder', () => {
    expect(hasChartPlaceholders('Just plain text')).toBe(false)
  })
})

describe('extractChartIds', () => {
  test('extracts single ID', () => {
    const result = extractChartIds('Text [[CHART:abc-123:revenue]]')
    expect(result).toEqual(['abc-123'])
  })

  test('extracts multiple IDs', () => {
    const result = extractChartIds('[[CHART:aaa:x]] middle [[CHART:bbb:y]]')
    expect(result).toEqual(['aaa', 'bbb'])
  })

  test('returns empty array when no placeholders', () => {
    expect(extractChartIds('no charts here')).toEqual([])
  })
})

describe('parseContentSegments idempotency', () => {
  test('calling twice with same content returns same result (no regex state leakage)', () => {
    const content = '[[CHART:aaa:x]][[CHART:bbb:y]]'

    const result1 = parseContentSegments(content)
    const result2 = parseContentSegments(content)

    expect(result1).toEqual(result2)
    expect(result1).toHaveLength(2)
  })

  test('calling with different content sequentially works correctly', () => {
    const content1 = '[[CHART:aaa:x]]'
    const content2 = '[[CHART:bbb:y]][[CHART:ccc:z]]'

    const result1 = parseContentSegments(content1)
    const result2 = parseContentSegments(content2)

    expect(result1).toHaveLength(1)
    expect(result2).toHaveLength(2)
  })
})
