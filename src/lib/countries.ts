/**
 * Country codes utility based on i18n-iso-countries.
 *
 * Provides localized country names for ISO 3166-1 alpha-2 codes.
 * The module is lazily loaded to avoid adding ~150KB to the initial bundle.
 * Registers only ru/en locales to keep bundle minimal.
 *
 * All functions are async — the library (~80KB with 2 locales) is loaded lazily
 * on first call to avoid bloating the initial bundle.
 */

type CountriesModule = typeof import('i18n-iso-countries')

let countriesModule: CountriesModule | null = null
let initPromise: Promise<CountriesModule> | null = null

/**
 * Lazily initialize i18n-iso-countries module.
 * Loads the module and registers ru/en locales on first call.
 * Subsequent calls return the cached module immediately.
 */
async function ensureCountries(): Promise<CountriesModule> {
  if (countriesModule) return countriesModule

  if (!initPromise) {
    initPromise = (async () => {
      const [mod, enLocale, ruLocale] = await Promise.all([
        import('i18n-iso-countries'),
        import('i18n-iso-countries/langs/en.json'),
        import('i18n-iso-countries/langs/ru.json'),
      ])
      const countries = mod.default ?? mod
      countries.registerLocale(enLocale.default ?? enLocale)
      countries.registerLocale(ruLocale.default ?? ruLocale)
      countriesModule = countries
      return countries
    })()
  }

  return initPromise
}

/**
 * Get localized country name by ISO alpha-2 code.
 * Falls back to code itself if not found.
 */
export async function getCountryName(code: string, locale: string): Promise<string> {
  const countries = await ensureCountries()
  return countries.getName(code.toUpperCase(), locale) ?? code
}

/**
 * Get all countries as { code, name } pairs for a given locale.
 * Sorted alphabetically by name.
 */
const countryOptionsCache = new Map<string, Array<{ value: string; label: string }>>()

export async function getCountryOptions(
  locale: string
): Promise<Array<{ value: string; label: string }>> {
  const cached = countryOptionsCache.get(locale)
  if (cached) return cached

  const countries = await ensureCountries()
  const names = countries.getNames(locale)
  const result = Object.entries(names)
    .map(([code, name]) => ({ value: code, label: `${name} (${code})` }))
    .toSorted((a, b) => a.label.localeCompare(b.label, locale))

  countryOptionsCache.set(locale, result)
  return result
}

/**
 * Validate that a string is a valid ISO 3166-1 alpha-2 country code.
 */
export async function isValidCountryCode(code: string): Promise<boolean> {
  const countries = await ensureCountries()
  return countries.isValid(code.toUpperCase())
}
