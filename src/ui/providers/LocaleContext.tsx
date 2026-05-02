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
import type { Locale as I18nLocale, Messages } from '@/infrastructure/i18n'
import { LOCALE_COOKIE_NAME, LOCALE_STORAGE_KEY } from '@/lib/constants'
import dayjs from '@/lib/dayjs'
import { logger } from '@/lib/logger'
import { loadFromStorage, saveToStorage } from '@/lib/storage'

export type { Locale } from '@/infrastructure/i18n'

const COOKIE_MAX_AGE = 31_536_000 // 1 year in seconds
const SUPPORTED_LOCALES = new Set<I18nLocale>(['en'])

function isValidLocale(locale: string | null): locale is I18nLocale {
  return locale !== null && SUPPORTED_LOCALES.has(locale as I18nLocale)
}

function setLocaleCookie(locale: I18nLocale) {
  const secureAttribute = globalThis.location?.protocol === 'https:' ? '; Secure' : ''
  // eslint-disable-next-line unicorn/no-document-cookie -- Simple cookie set; no need for cookie library
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secureAttribute}`
}

function getLocaleCookie(): I18nLocale | null {
  if (globalThis.document === undefined) return null

  const cookies = document.cookie
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.startsWith(`${LOCALE_COOKIE_NAME}=`))

  for (const cookie of cookies) {
    const value = decodeURIComponent(cookie.slice(LOCALE_COOKIE_NAME.length + 1))
    if (isValidLocale(value)) return value
  }

  return null
}

type LocaleContextValue = {
  locale: I18nLocale
  messages: Messages
  setLocale: (locale: I18nLocale) => void
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined)

type LocaleProviderProps = {
  children: ReactNode
  initialLocale?: I18nLocale
}

export function LocaleProvider({ children, initialLocale = 'en' }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<I18nLocale>(initialLocale)
  const [messages, setMessages] = useState<Messages>(defaultMessages)

  const setLocale = useCallback((newLocale: I18nLocale) => {
    setLocaleState(newLocale)
    loadMessages(newLocale)
      .then(setMessages)
      .catch((error) => logger.error('Failed to load locale messages', error))
  }, [])

  // Sync localStorage to cookie on mount (migration for users who had locale in localStorage only).
  // If initialLocale already matches localStorage, no state change occurs -- no flicker.
  useEffect(() => {
    const saved = loadFromStorage<I18nLocale | null>({
      key: LOCALE_STORAGE_KEY,
      defaultValue: null,
      validate: (value): value is I18nLocale | null =>
        value === null || isValidLocale(typeof value === 'string' ? value : null),
    })
    const nextLocale = saved ?? getLocaleCookie() ?? initialLocale

    // Ensure cookie is set even if locale matches (migration path).
    setLocaleCookie(nextLocale)

    if (nextLocale !== initialLocale) {
      setLocale(nextLocale)
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
