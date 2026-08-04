export interface PhoneCountry {
  iso2: string
  dialCode: string
}

export const DEFAULT_PHONE_COUNTRY: PhoneCountry = { iso2: 'in', dialCode: '91' }

/**
 * Stored phone (India = bare 10 digits, else +E.164) -> the value `PhoneInput`
 * understands, which is always prefixed with a country dial code.
 */
export function toInputPhone(stored?: string): string {
  if (!stored) return ''
  const trimmed = stored.trim()
  return trimmed.startsWith('+') ? trimmed : `+91${trimmed.replace(/\D/g, '')}`
}

/** Digits of the number without its country dial code. */
export function nationalDigits(full: string, country: PhoneCountry): string {
  const digits = full.replace(/\D/g, '')
  const dial = country.dialCode
  return dial && digits.startsWith(dial) ? digits.slice(dial.length) : digits
}

/**
 * The value we persist: India -> bare 10 digits (matches existing records);
 * any other country -> full E.164.
 */
export function toStoredPhone(full: string, country: PhoneCountry): string {
  return country.iso2 === 'in'
    ? nationalDigits(full, country)
    : `+${full.replace(/\D/g, '')}`
}

/** Returns an error message, or null when the number is valid. */
export function validatePhone(full: string, country: PhoneCountry): string | null {
  const national = nationalDigits(full, country)
  if (!national) return 'Phone number is required'
  if (country.iso2 === 'in' && national.length !== 10) {
    return 'Enter a valid 10-digit phone number'
  }
  if (country.iso2 !== 'in' && national.length < 4) {
    return 'Enter a valid phone number'
  }
  return null
}
