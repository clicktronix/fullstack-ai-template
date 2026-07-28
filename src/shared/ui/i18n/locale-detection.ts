import type { Locale } from './types'

const DEFAULT_LOCALE: Locale = 'en'
const SUPPORTED_LOCALES = new Set<Locale>(['en'])

export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null

  const language = value.trim().toLowerCase().split(/[-_]/)[0]
  return SUPPORTED_LOCALES.has(language as Locale) ? (language as Locale) : null
}

function parseQuality(value: string | undefined): number {
  if (!value) return 1

  const quality = Number.parseFloat(value)
  if (!Number.isFinite(quality)) return 0
  if (quality < 0 || quality > 1) return 0
  return quality
}

export function parseAcceptLanguage(acceptLanguage: string | null | undefined): Locale | null {
  if (!acceptLanguage) return null

  return (
    acceptLanguage
      .split(',')
      .map((part, index) => {
        const [rawLocale, ...parameters] = part.trim().split(';')
        const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith('q='))
        const quality = parseQuality(qualityParameter?.split('=')[1])

        return {
          index,
          locale: normalizeLocale(rawLocale),
          quality,
        }
      })
      .filter((item) => item.locale && item.quality > 0)
      .sort((a, b) => b.quality - a.quality || a.index - b.index)[0]?.locale ?? null
  )
}

export function resolveInitialLocale({
  cookieLocale,
  acceptLanguage,
}: {
  cookieLocale?: string | null
  acceptLanguage?: string | null
}): Locale {
  return normalizeLocale(cookieLocale) ?? parseAcceptLanguage(acceptLanguage) ?? DEFAULT_LOCALE
}
