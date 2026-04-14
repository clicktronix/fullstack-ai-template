import { describe, expect, test } from 'bun:test'
import { buildDynamicSelect } from '../server-query'
import type { FilterConfigMap, RelationSelectConfig } from '../server-query'

describe('buildDynamicSelect', () => {
  const baseSelect = 'id, name, status'

  const relationSelects: RelationSelectConfig = {
    item_labels: {
      left: 'item_labels(label_id, labels(id, name))',
      inner: 'item_labels(label_id, labels(id, name))',
    },
    filter_labels: {
      left: '',
      inner: 'filter_labels:item_labels!inner(label_id)',
    },
    item_assignees: {
      left: 'item_assignees(users(id, full_name))',
      inner: 'item_assignees(users(id, full_name))',
    },
  }

  const filterConfig: FilterConfigMap = {
    labels: { column: 'label_id', operator: 'in', relation: 'filter_labels' },
  }

  test('includes all left joins when no filters active', () => {
    const result = buildDynamicSelect(baseSelect, {}, relationSelects, filterConfig)

    expect(result).toContain('item_labels(label_id, labels(id, name))')
    expect(result).toContain('item_assignees(users(id, full_name))')
    expect(result).not.toContain('filter_labels')
  })

  test('adds filter alias INNER JOIN when filter active', () => {
    const params = { labels: ['label-1', 'label-2'] }
    const result = buildDynamicSelect(baseSelect, params, relationSelects, filterConfig)

    expect(result).toContain('item_labels(label_id, labels(id, name))')
    expect(result).toContain('filter_labels:item_labels!inner(label_id)')
  })

  test('skips empty select strings for inactive filter aliases', () => {
    const result = buildDynamicSelect(baseSelect, {}, relationSelects, filterConfig)
    const parts = result.split(',').map((s) => s.trim())

    // No empty parts
    expect(parts.every((p) => p.length > 0)).toBe(true)
    // No double commas
    expect(result).not.toContain(',,')
  })

  test('skips filter alias when filter value is empty array', () => {
    const params = { labels: [] }
    const result = buildDynamicSelect(baseSelect, params, relationSelects, filterConfig)

    expect(result).not.toContain('filter_labels')
  })

  test('skips filter alias when filter value is undefined', () => {
    const params = { labels: undefined }
    const result = buildDynamicSelect(baseSelect, params, relationSelects, filterConfig)

    expect(result).not.toContain('filter_labels')
  })
})
