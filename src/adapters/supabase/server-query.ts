import 'server-only'

/**
 * Generic server-side query builder utilities for Supabase.
 *
 * Provides declarative filter/sort/pagination config that can be applied
 * to any Supabase select query. All functions are pure — they take a query
 * and return the same query with applied modifications.
 */

// ===== Types =====

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'ilike'
  | 'gte'
  | 'lte'
  | 'in'
  | 'is_not_null'
  | 'is_null'

export type FilterConfig = {
  column: string
  operator: FilterOperator
  relation?: string
  transform?: (v: unknown) => unknown
}

export type SortItem = {
  key: string
  direction: 'asc' | 'desc'
}

/**
 * Maps filter config keys to their param names in the current query params object.
 * Record<paramKey, FilterConfig>
 */
export type FilterConfigMap = Record<string, FilterConfig>

/**
 * Relation select config: for each relation, defines the default (left join)
 * and active (inner join) select strings.
 *
 * Example:
 * ```
 * { item_labels: { left: 'item_labels(label_id)', inner: 'item_labels!inner(label_id)' } }
 * ```
 */
export type RelationSelectConfig = Record<string, { left: string; inner: string }>

// ===== Minimal query type =====

/**
 * Minimal interface for Supabase query objects.
 * All filter/transform methods return `this`, so we can type the builder
 * generically without importing heavy Supabase generics.
 *
 * Uses `type` per project convention (no interfaces).
 */
type SupabaseFilterQuery = {
  eq(column: string, value: unknown): SupabaseFilterQuery
  neq(column: string, value: unknown): SupabaseFilterQuery
  ilike(column: string, pattern: string): SupabaseFilterQuery
  gte(column: string, value: unknown): SupabaseFilterQuery
  lte(column: string, value: unknown): SupabaseFilterQuery
  in(column: string, values: readonly unknown[]): SupabaseFilterQuery
  is(column: string, value: null | boolean): SupabaseFilterQuery
  not(column: string, operator: string, value: unknown): SupabaseFilterQuery
  or(filters: string): SupabaseFilterQuery
  order(
    column: string,
    options?: { ascending?: boolean; nullsFirst?: boolean }
  ): SupabaseFilterQuery
  range(from: number, to: number): SupabaseFilterQuery
}

// ===== Functions =====

function getFilterColumn(config: FilterConfig): string {
  return config.relation ? `${config.relation}.${config.column}` : config.column
}

function applyServerFilter<Q extends SupabaseFilterQuery>(
  query: Q,
  config: FilterConfig,
  value: unknown
): Q {
  const column = getFilterColumn(config)

  switch (config.operator) {
    case 'eq': {
      return query.eq(column, value) as Q
    }
    case 'neq': {
      return query.neq(column, value) as Q
    }
    case 'ilike': {
      const transformed = config.transform ? (config.transform(value) as string) : String(value)
      return query.ilike(column, transformed) as Q
    }
    case 'gte': {
      return query.gte(column, value) as Q
    }
    case 'lte': {
      return query.lte(column, value) as Q
    }
    case 'in': {
      const arr = value as readonly unknown[]
      return arr.length > 0 ? (query.in(column, arr) as Q) : query
    }
    case 'is_not_null': {
      if (value === 'yes') return query.not(column, 'is', null) as Q
      if (value === 'no') return query.is(column, null) as Q
      return query
    }
    case 'is_null': {
      return query.is(column, null) as Q
    }
  }
}

/**
 * Apply declarative filters to a Supabase query.
 *
 * Iterates over filterConfigMap entries, checks if params has a value for
 * each key, and applies the corresponding Supabase operator.
 * Skips undefined/null param values.
 *
 * For `is_not_null`: 'yes' → `.not(column, 'is', null)`, 'no' → `.is(column, null)`
 * For `in`: value must be an array, uses `.in(column, value)`
 * For `ilike`: applies transform (e.g., wrapping in %) before `.ilike()`
 * For relation filters: applies filter on `relation.column` (e.g., `item_labels.label_id`)
 */
export function applyServerFilters<Q extends SupabaseFilterQuery>(
  query: Q,
  params: Record<string, unknown>,
  filterConfigMap: FilterConfigMap
): Q {
  for (const [paramKey, config] of Object.entries(filterConfigMap)) {
    const value = params[paramKey]

    if (value === undefined || value === null) continue

    query = applyServerFilter(query, config, value)
  }

  return query
}

/**
 * Build a dynamic select string by appending relation selects to the base select.
 *
 * The base select contains only scalar fields. This function appends all relation
 * selects: INNER JOIN for relations with active filters (required by PostgREST
 * to properly filter parent rows), LEFT JOIN for the rest.
 *
 * @param baseSelect - The base select string with scalar fields only
 * @param params - Current query params to check which filters are active
 * @param relationSelects - Config mapping relation names to left/inner select strings
 * @param filterConfigMap - The filter config map (to determine which relations are active)
 */
export function buildDynamicSelect(
  baseSelect: string,
  params: Record<string, unknown>,
  relationSelects: RelationSelectConfig,
  filterConfigMap: FilterConfigMap
): string {
  // Определяем, какие relations имеют активные фильтры
  const activeRelations = new Set<string>()
  for (const [paramKey, config] of Object.entries(filterConfigMap)) {
    if (!config.relation) continue
    const value = params[paramKey]
    if (value === undefined || value === null) continue
    if (Array.isArray(value) && value.length === 0) continue
    activeRelations.add(config.relation)
  }

  // Собираем select: базовые скалярные поля + все relations
  // Для relations с активным фильтром — inner join, для остальных — left join
  const parts = [baseSelect]
  for (const [relation, selects] of Object.entries(relationSelects)) {
    const selectStr = activeRelations.has(relation) ? selects.inner : selects.left
    if (selectStr) {
      parts.push(selectStr)
    }
  }

  return parts.join(', ')
}

/**
 * Apply multi-sort to a Supabase query via chained `.order()` calls.
 *
 * @param query - The Supabase query to apply sorting to
 * @param sort - Array of sort items (key + direction), applied in order
 */
export function applyServerSort<Q extends SupabaseFilterQuery>(
  query: Q,
  sort: SortItem[] | undefined
): Q {
  if (!sort || sort.length === 0) return query

  for (const item of sort) {
    // nullsFirst: false pushes NULLs to the end regardless of sort direction.
    // This prevents nullable columns (engagement_rate, avg_reach) from breaking results.
    query = query.order(item.key, {
      ascending: item.direction === 'asc',
      nullsFirst: false,
    }) as Q
  }

  return query
}

/**
 * Apply pagination to a Supabase query via `.range()`.
 *
 * Converts page-based pagination (1-indexed) to Supabase range (0-indexed, inclusive).
 *
 * @param query - The Supabase query to paginate
 * @param page - 1-indexed page number
 * @param pageSize - Number of items per page
 */
export function applyServerPagination<Q extends SupabaseFilterQuery>(
  query: Q,
  page: number,
  pageSize: number
): Q {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  return query.range(from, to) as Q
}
