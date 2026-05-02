/**
 * Local Storage Utility
 * Provides type-safe localStorage access for small browser-only preferences.
 */

export type StorageOptions<T> = {
  /** Storage key */
  key: string
  /** Default value when storage is empty or invalid */
  defaultValue: T
  /** Optional validator function */
  validate?: (value: unknown) => value is T
}

/**
 * Load value from localStorage with type safety.
 * Returns defaultValue if:
 * - Running on server (SSR)
 * - Storage is empty
 * - Parsing fails
 * - Validation fails
 */
export function loadFromStorage<T>({ key, defaultValue, validate }: StorageOptions<T>): T {
  if (globalThis.window === undefined) return defaultValue

  try {
    const saved = localStorage.getItem(key)
    if (!saved) return defaultValue

    const parsed: unknown = JSON.parse(saved)

    if (validate) {
      return validate(parsed) ? parsed : defaultValue
    }

    // Basic type safety when no validator provided:
    // Reject obvious type mismatches (e.g., stored string when expecting object)
    if (typeof parsed !== typeof defaultValue) {
      return defaultValue
    }
    if (
      typeof defaultValue === 'object' &&
      defaultValue !== null &&
      (parsed === null || Array.isArray(parsed) !== Array.isArray(defaultValue))
    ) {
      return defaultValue
    }

    return parsed as T
  } catch {
    return defaultValue
  }
}

/**
 * Save value to localStorage.
 * Silently ignores errors (e.g., quota exceeded, private browsing).
 */
export function saveToStorage<T>(key: string, value: T): void {
  if (globalThis.window === undefined) return

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage errors
  }
}

/**
 * Remove value from localStorage.
 */
export function removeFromStorage(key: string): void {
  if (globalThis.window === undefined) return

  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore storage errors
  }
}

/**
 * Create a storage accessor with bound key and default value.
 * Useful for creating typed storage helpers.
 *
 * @example
 * const sidebarStorage = createStorageAccessor({
 *   key: 'template-sidebar-preferences',
 *   defaultValue: { collapsed: false },
 *   validate: isValidSidebarPreferences,
 * })
 *
 * const prefs = sidebarStorage.load()
 * sidebarStorage.save({ ...prefs, collapsed: true })
 */
export function createStorageAccessor<T>(options: StorageOptions<T>) {
  return {
    load: () => loadFromStorage(options),
    save: (value: T) => saveToStorage(options.key, value),
    remove: () => removeFromStorage(options.key),
  }
}
