/**
 * Поддерживаемые коды стран CIS/Near — основной рынок платформы.
 * Используются для фильтрации аудитории блогеров.
 */
import { type InferOutput, picklist } from 'valibot'

export const COUNTRY_CODES = [
  'KZ',
  'RU',
  'UZ',
  'KG',
  'TJ',
  'BY',
  'UA',
  'GE',
  'AZ',
  'AM',
  'TR',
  'AE',
  'US',
  'GB',
  'DE',
  'IN',
] as const

export const CountryCodeSchema = picklist(COUNTRY_CODES)
export type CountryCode = InferOutput<typeof CountryCodeSchema>

/** Regex для валидации ISO 3166-1 alpha-2/3 кодов стран */
export const COUNTRY_CODE_PATTERN = /^[A-Z]{2,5}$/
