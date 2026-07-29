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

export const SITE_TITLE =
  'Spoken English in Tamil – Learn English Through Tamil | English Pesalam'

export const SITE_DESCRIPTION =
  'Learn Spoken English in Tamil with simple lessons, daily-use English sentences, grammar, vocabulary, speaking practice, quizzes and online classes from English Pesalam.'

export const SITE_KEYWORDS = [
  'spoken english in tamil',
  'spoken english through tamil',
  'English pesalam',
  'learn english through tamil',
  'learn spoken english in tamil',
  'spoken english course in tamil',
  'online spoken english classes in tamil',
  'free spoken english course in tamil',
  'basic spoken english in tamil',
  'English speaking practice',
  'spoken english for beginners in tamil',
  'english speaking practice in tamil',
  'daily use english sentences with tamil meaning',
  'english grammar in tamil',
  'how to make english sentences in tamil',
  'english vocabulary with tamil meaning',
  'spoken english quiz in tamil',
]

/** Join a path onto the canonical origin, guaranteeing a single slash. */
export function absoluteUrl(path = ''): string {
  if (!path) return SITE_URL
  return `${SITE_URL}/${path.replace(/^\/+/, '')}`
}
