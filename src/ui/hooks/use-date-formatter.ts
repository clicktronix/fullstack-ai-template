'use client'

import { useMemo } from 'react'
import { useLocale, type Locale } from '@/ui/providers/LocaleContext'

const LOCALE_MAP: Record<Locale, string> = {
  ru: 'ru-RU',
  en: 'en-US',
}

function normalizeDate(value: string | Date): Date {
  return typeof value === 'string' ? new Date(value) : value
}

export function useDateFormatter() {
  const { locale: shortLocale } = useLocale()
  const locale = LOCALE_MAP[shortLocale]

  return useMemo(() => {
    const shortFormatter = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
    })
    const mediumFormatter = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    const fullFormatter = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    return {
      short: (value: string | Date) => shortFormatter.format(normalizeDate(value)),
      medium: (value: string | Date) => mediumFormatter.format(normalizeDate(value)),
      full: (value: string | Date) => fullFormatter.format(normalizeDate(value)),
    }
  }, [locale])
}
