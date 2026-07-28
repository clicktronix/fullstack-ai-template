/**
 * Status-to-color mappings for badges and UI indicators.
 *
 * Moved from domain/ — color mapping is a UI concern, not a domain concern.
 */

type StatusColorMap = Record<string, string>

export const ITEM_STATUS_COLORS: StatusColorMap = {
  active: 'green',
  archived: 'red',
}

export const USER_ROLE_COLORS: StatusColorMap = {
  owner: 'dark',
  admin: 'sky',
}

export function getStatusColor(
  colorMap: StatusColorMap,
  status: string | null | undefined
): string {
  if (!status) return 'dark'
  return colorMap[status] ?? 'dark'
}
