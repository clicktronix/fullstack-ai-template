import { ruMessages } from './locales/ru'
import type { Locale, Messages } from './types'

export type { Locale, LocaleMessages, MessageKey, Messages } from './types'

export const defaultMessages: Messages = ruMessages

export async function loadMessages(locale: Locale): Promise<Messages> {
  if (locale === 'ru') return ruMessages
  const { enMessages } = await import('./locales/en')
  return enMessages
}
