import { parsePhoneNumberFromString } from 'libphonenumber-js'

export function formatPhone(phone: string, countryCode?: string | null): string {
  const normalizedCountryCode = countryCode ? countryCode.replace(/^\+/, '') : ''
  const normalizedPhone = phone.replaceAll(/\s+/g, '')
  const fullNumber = normalizedCountryCode
    ? `+${normalizedCountryCode}${normalizedPhone}`
    : normalizedPhone

  const parsed = parsePhoneNumberFromString(fullNumber)
  if (parsed) {
    return parsed.formatInternational()
  }

  return fullNumber
}
