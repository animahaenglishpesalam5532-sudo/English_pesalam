// Decides whether an inbound WhatsApp message should get the canned reply,
// and holds the reply copy itself.

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

/** Don't re-send the same blurb to a customer who keeps chatting. */
const REPLY_COOLDOWN_MS = 24 * 60 * 60 * 1000

/**
 * Meta re-delivers a webhook event if we are slow to answer, so the same
 * message id can arrive twice. Remember recent ids to stay idempotent.
 */
const SEEN_MESSAGE_LIMIT = 500

const lastRepliedAt = new Map<string, number>()
const seenMessageIds = new Set<string>()

/** True the first time a given message id is seen, false on redelivery. */
export function markMessageSeen(messageId?: string): boolean {
  if (!messageId) return true
  if (seenMessageIds.has(messageId)) return false

  seenMessageIds.add(messageId)

  // Bounded set — drop the oldest entries once it grows past the limit.
  if (seenMessageIds.size > SEEN_MESSAGE_LIMIT) {
    const oldest = seenMessageIds.values().next().value
    if (oldest) seenMessageIds.delete(oldest)
  }

  return true
}

/**
 * True when this sender is due an auto-reply. Records the send immediately so
 * concurrent invocations in the same instance can't double-fire.
 *
 * Note: state is per serverless instance, so on Vercel a customer may
 * occasionally get the reply more than once per day across cold starts.
 * Move this to Supabase if exactly-once matters.
 */
export function claimAutoReply(from?: string): boolean {
  if (!from) return false

  const now = Date.now()
  const previous = lastRepliedAt.get(from)

  if (previous && now - previous < REPLY_COOLDOWN_MS) return false

  lastRepliedAt.set(from, now)
  return true
}
