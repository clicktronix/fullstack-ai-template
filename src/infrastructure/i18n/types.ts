import type { ruMessages } from './locales/ru'

export type Locale = 'ru' | 'en'

export type MessageKey = keyof typeof ruMessages

export type Messages = Record<MessageKey, string>

export type LocaleMessages = Record<Locale, Messages>
