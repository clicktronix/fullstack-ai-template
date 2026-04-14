/**
 * Escapes special characters in a PostgreSQL LIKE/ILIKE pattern.
 * Escapes: % (wildcard), _ (single char), \ (escape char)
 */
export function escapeLikePattern(value: string): string {
  return value.replaceAll(/[%_\\]/g, String.raw`\$&`)
}
