// Phone number handling for the bulk template sender.
// The Cloud API wants digits only, country code included, no '+'.

export const DEFAULT_COUNTRY_CODE = '91'

/** Splits a pasted blob ("+91 900..., 44700...") into individual entries. */
export function splitPhoneInput(raw: string): string[] {
  return (raw ?? '')
    .split(/[\s,;\n\r\t]+/)
    .map((v) => v.trim())
    .filter(Boolean)
}

/**
 * Normalises one entry to the wire format, or returns null when it cannot be
 * a valid number. Entries without a leading '+' and no more than 10 digits are
 * treated as local numbers and get `countryCode` prefixed.
 */
export function normalizePhone(raw: string, countryCode = DEFAULT_COUNTRY_CODE): string | null {
  const trimmed = raw?.trim() ?? ''
  if (!trimmed) return null

  const isInternational = trimmed.startsWith('+')
  let digits = trimmed.replace(/\D/g, '')
  if (!digits) return null

  if (!isInternational) {
    digits = digits.replace(/^0+/, '')
    if (!digits) return null
    if (digits.length <= 10) {
      const code = (countryCode ?? '').replace(/\D/g, '') || DEFAULT_COUNTRY_CODE
      digits = `${code}${digits}`
    }
  }

  // E.164 allows 8–15 digits including the country code.
  if (digits.length < 8 || digits.length > 15) return null
  return digits
}

/** `919345639627` -> `+91 9345639627` for display. */
export function formatPhone(digits: string): string {
  if (!digits) return ''
  const code = digits.length > 10 ? digits.slice(0, digits.length - 10) : ''
  return code ? `+${code} ${digits.slice(code.length)}` : `+${digits}`
}
