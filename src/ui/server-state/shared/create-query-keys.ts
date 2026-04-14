/**
 * Factory function for creating standardized query keys.
 * Follows TanStack Query best practices for cache management.
 *
 * @example
 * ```typescript
 * const categoryKeys = createQueryKeys('categories')
 * // categoryKeys.all => ['categories']
 * // categoryKeys.list() => ['categories', 'list']
 * // categoryKeys.detail('123') => ['categories', 'detail', '123']
 * ```
 */
export function createQueryKeys<T extends string>(baseName: T) {
  const all = [baseName] as const

  return {
    /** Root key for all queries of this entity type */
    all,
    /** Base key for list invalidation */
    lists: () => [...all, 'list'] as const,
    /** Query key for list queries */
    list: () => [...all, 'list'] as const,
    /** Base key for detail invalidation */
    details: () => [...all, 'detail'] as const,
    /** Query key for single entity detail */
    detail: (id: string) => [...all, 'detail', id] as const,
  } as const
}
