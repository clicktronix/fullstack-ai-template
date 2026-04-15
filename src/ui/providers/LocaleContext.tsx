'use client'

import {
  createContext,
  use,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react'
import { defaultMessages, loadMessages } from '@/infrastructure/i18n'
import type { Messages } from '@/infrastructure/i18n'
import { LOCALE_COOKIE_NAME, LOCALE_STORAGE_KEY } from '@/lib/constants'
import dayjs from '@/lib/dayjs'
import { logger } from '@/lib/logger'
import { loadFromStorage, saveToStorage } from '@/lib/storage'

export type Locale = 'ru' | 'en'

const COOKIE_MAX_AGE = 31_536_000 // 1 year in seconds
const SUPPORTED_LOCALES = new Set<Locale>(['ru', 'en'])

function isValidLocale(locale: string | null): locale is Locale {
  return locale !== null && SUPPORTED_LOCALES.has(locale as Locale)
}

function setLocaleCookie(locale: Locale) {
  // eslint-disable-next-line unicorn/no-document-cookie -- Simple cookie set; no need for cookie library
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

type LocaleContextValue = {
  locale: Locale
  messages: Messages
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined)

type LocaleProviderProps = {
  children: ReactNode
  initialLocale?: Locale
}

export function LocaleProvider({ children, initialLocale = 'ru' }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [messages, setMessages] = useState<Messages>(defaultMessages)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    loadMessages(newLocale)
      .then(setMessages)
      .catch((error) => logger.error('Failed to load locale messages', error))
  }, [])

  // Sync localStorage to cookie on mount (migration for users who had locale in localStorage only).
  // If initialLocale already matches localStorage, no state change occurs -- no flicker.
  useEffect(() => {
    const saved = loadFromStorage<Locale>({
      key: LOCALE_STORAGE_KEY,
      defaultValue: initialLocale,
      validate: (value): value is Locale => isValidLocale(typeof value === 'string' ? value : null),
    })

    // Ensure cookie is set even if locale matches (migration path)
    setLocaleCookie(saved)

    if (saved !== initialLocale) {
      setLocale(saved)
    }
  }, [initialLocale, setLocale])

  useEffect(() => {
    saveToStorage(LOCALE_STORAGE_KEY, locale)
    setLocaleCookie(locale)
    dayjs.locale(locale)
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      messages,
      setLocale,
    }),
    [locale, messages, setLocale]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = use(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return context
}
