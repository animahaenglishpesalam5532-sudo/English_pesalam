/** Internal domain used to turn a bare username into a Supabase auth email. */
export const LOGIN_DOMAIN = 'englishpesalam.com'

/** Usernames become emails, so they must be safe as a local part. */
const USERNAME_RE = /^[a-zA-Z0-9._-]+$/
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/**
 * Team members sign in with a bare username (e.g. "delivery1"); admins use a
 * full email. Both map to the address Supabase actually authenticates against.
 */
export function toLoginEmail(identifier: string): string {
  const trimmed = identifier?.trim().toLowerCase() ?? ''
  return trimmed.includes('@') ? trimmed : `${trimmed}@${LOGIN_DOMAIN}`
}

/**
 * What the member actually types to sign in: the bare username for internal
 * accounts, the untouched address for real external emails.
 */
export function toLoginIdentifier(email: string): string {
  const trimmed = email?.trim() ?? ''
  const suffix = `@${LOGIN_DOMAIN}`
  return trimmed?.toLowerCase().endsWith(suffix)
    ? trimmed.slice(0, -suffix.length)
    : trimmed
}

/** Returns an error message, or null when the identifier can be used to log in. */
export function validateLoginIdentifier(identifier: string): string | null {
  const trimmed = identifier?.trim() ?? ''
  if (!trimmed) return 'Username or email is required'
  if (trimmed.includes('@')) {
    return EMAIL_RE.test(trimmed) ? null : 'Enter a valid email address'
  }
  return USERNAME_RE.test(trimmed)
    ? null
    : 'Username can only use letters, numbers, dot, dash and underscore'
}
