/**
 * String formatting utilities.
 */

/**
 * Format tool name for display.
 * Converts snake_case and camelCase to Title case with spaces.
 *
 * @example
 * formatToolName('get_user_info') // 'Get user info'
 * formatToolName('fetchDataFromAPI') // 'Fetch data from api'
 */
export function formatToolName(name: string): string {
  return name
    .replaceAll('_', ' ')
    .replaceAll(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
}
