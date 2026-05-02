import type { enMessages } from './locales/en'

export type Locale = 'en'

export type MessageKey = keyof typeof enMessages

export type Messages = Record<MessageKey, string>

export type LocaleMessages = Record<Locale, Messages>
