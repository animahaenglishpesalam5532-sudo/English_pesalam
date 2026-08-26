// The canned card sent to a customer the first time they message us.
//
// Both guards this file used to hold — "have I seen this message id?" and
// "have I already replied to this number today?" — now live in the database
// (migration 012). The in-memory versions were per serverless instance, so on
// Vercel they silently stopped working after every cold start.

import type { CtaUrlMessage } from './client'

/** Sales number customers are handed off to — not the API sending number. */
const SALES_WHATSAPP_NUMBER = '919345639627'
const PREFILLED_ENQUIRY = 'I want to buy Book 2'

export const AUTO_REPLY_CARD: CtaUrlMessage = {
  header: 'Our new book 2 is out now!',
  body: 'Learn spoken English the simple way — clear lessons, daily practice and real-life conversations.',
  footer: 'English Pesalam',
  buttonText: 'Buy Now',
  buttonUrl: `https://wa.me/${SALES_WHATSAPP_NUMBER}?text=${encodeURIComponent(PREFILLED_ENQUIRY)}`,
}

/** How the card reads in the inbox thread, where buttons cannot be rendered. */
export const AUTO_REPLY_PREVIEW = [
  AUTO_REPLY_CARD.header,
  AUTO_REPLY_CARD.body,
  `[${AUTO_REPLY_CARD.buttonText}] ${AUTO_REPLY_CARD.buttonUrl}`,
]
  .filter(Boolean)
  .join('\n\n')
