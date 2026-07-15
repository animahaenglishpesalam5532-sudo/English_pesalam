/**
 * Central SEO configuration.
 *
 * SITE_URL is the canonical production origin used for metadataBase, canonical
 * links, sitemap and structured data. It prefers NEXT_PUBLIC_SITE_URL when that
 * is a real https origin (as set in Vercel), and otherwise falls back to the
 * production domain so local builds still emit correct absolute URLs.
 */
const raw = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '')

export const SITE_URL = raw && raw.startsWith('https://') ? raw : 'https://englishpesalam.com'

export const SITE_NAME = 'English Pesalam'

export const SITE_DESCRIPTION =
  'Master English step by step with simple lessons, practical tips, and clear Tamil explanations.'

export const SITE_KEYWORDS = [
  'learn English',
  'English in Tamil',
  'spoken English Tamil',
  'English grammar Tamil',
  'English lessons Tamil explanation',
  'English Pesalam',
  'Tamil to English',
  'English speaking practice',
]

/** Join a path onto the canonical origin, guaranteeing a single slash. */
export function absoluteUrl(path = ''): string {
  if (!path) return SITE_URL
  return `${SITE_URL}/${path.replace(/^\/+/, '')}`
}
