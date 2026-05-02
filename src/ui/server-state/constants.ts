/**
 * Centralized staleTime constants for TanStack Query.
 *
 * Use these instead of magic numbers in query options.
 */
export const STALE_TIME = {
  /** 5 minutes - for reference data that rarely changes (labels, team settings, lookup lists) */
  REFERENCE_DATA: 5 * 60 * 1000,
  /** 2 minutes - for entity-associated reference data */
  ENTITY_REFERENCE: 2 * 60 * 1000,
  /** 1 minute - for data that changes moderately (lists, profile, dashboard slices) */
  FREQUENT_DATA: 60 * 1000,
  /** 1 hour - for data refreshed rarely or in scheduled jobs */
  BACKGROUND_DATA: 60 * 60 * 1000,
  /** Infinity - for data updated via subscriptions (session) */
  SESSION: Infinity,
} as const

/**
 * Centralized gcTime constants for TanStack Query.
 *
 * Controls how long inactive query data stays in memory.
 * Should be >= staleTime for the same category.
 */
export const GC_TIME = {
  /** 30 minutes - reference data cache survives longer for quick navigation */
  REFERENCE_DATA: 30 * 60 * 1000,
  /** 10 minutes - moderately changing data */
  FREQUENT_DATA: 10 * 60 * 1000,
  /** 15 minutes — long enough for list↔detail navigation without keeping stale data forever */
  BACKGROUND_DATA: 15 * 60 * 1000,
} as const

/** Default page size for server-side pagination. */
export const DEFAULT_PAGE_SIZE = 50

/** Filter debounce delay in milliseconds. */
export const FILTER_DEBOUNCE_DELAY = 400
