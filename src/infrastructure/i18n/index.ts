import { enMessages } from './locales/en'
import type { Locale, Messages } from './types'

export type { Locale, LocaleMessages, MessageKey, Messages } from './types'

export const defaultMessages: Messages = enMessages

export async function loadMessages(_locale: Locale): Promise<Messages> {
  return enMessages
}
