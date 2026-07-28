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
