// The canned reply sent to a customer the first time they message us.
//
// Both guards this file used to hold — "have I seen this message id?" and
// "have I already replied to this number today?" — now live in the database
// (migration 012). The in-memory versions were per serverless instance, so on
// Vercel they silently stopped working after every cold start.
//
// Plain text rather than an interactive card: the reply routes to two different
// numbers (books vs PDF/classes) and a `cta_url` card allows only one button.
// WhatsApp turns bare phone numbers in text into tappable links on its own.

/** Books and enquiries. */
const BOOK_ORDERS_NUMBER = '9345639627'
/** PDF downloads and online classes. */
const PDF_CLASSES_NUMBER = '6380513228'

export const AUTO_REPLY_TEXT = [
  `📚 Spoken English Book வாங்க வேண்டுமா? 👉 ${BOOK_ORDERS_NUMBER}`,
  `📄 PDF / Online Class வேண்டுமா? 👉 ${PDF_CLASSES_NUMBER}`,
].join('\n')
