import { useCallback } from 'react'
import type { Locale } from '@/ui/providers/LocaleContext'

export type LocaleSelectorProps = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export type LocaleSelectorViewProps = {
  locale: Locale
  onSetRussian: () => void
  onSetEnglish: () => void
}

export function useLocaleSelectorProps({
  locale,
  setLocale,
}: LocaleSelectorProps): LocaleSelectorViewProps {
  const onSetRussian = useCallback(() => setLocale('ru'), [setLocale])
  const onSetEnglish = useCallback(() => setLocale('en'), [setLocale])

  return {
    locale,
    onSetRussian,
    onSetEnglish,
  }
}
