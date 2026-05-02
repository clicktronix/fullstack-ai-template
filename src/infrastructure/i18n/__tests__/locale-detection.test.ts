import { describe, expect, test } from 'bun:test'
import { normalizeLocale, parseAcceptLanguage, resolveInitialLocale } from '../locale-detection'

describe('locale detection', () => {
  test('prefers cookie locale over Accept-Language', () => {
    expect(
      resolveInitialLocale({
        cookieLocale: 'en',
        acceptLanguage: 'en-US,en;q=0.9',
      })
    ).toBe('en')
  })

  test('parses region-specific Accept-Language values', () => {
    expect(parseAcceptLanguage('en-US,en;q=0.9,fr;q=0.8')).toBe('en')
    expect(parseAcceptLanguage('fr-CA,fr;q=0.9,en;q=0.8')).toBe('en')
  })

  test('normalizes cookie locale values', () => {
    expect(normalizeLocale('EN_us')).toBe('en')
    expect(normalizeLocale('fr')).toBeNull()
  })

  test('uses quality ordering and original order as a tie-breaker', () => {
    expect(parseAcceptLanguage('fr;q=0.7,en;q=0.9')).toBe('en')
    expect(parseAcceptLanguage('en;q=0.8,fr;q=0.8')).toBe('en')
  })

  test('ignores unsupported, disabled, and invalid quality values', () => {
    expect(parseAcceptLanguage('fr-CA,de;q=0.9')).toBeNull()
    expect(parseAcceptLanguage('en;q=0,fr;q=1')).toBeNull()
    expect(parseAcceptLanguage('en;q=2,fr;q=0.8')).toBeNull()
  })

  test('falls back to default locale', () => {
    expect(resolveInitialLocale({ acceptLanguage: 'fr-CA,fr;q=0.9' })).toBe('en')
    expect(resolveInitialLocale({})).toBe('en')
  })
})
