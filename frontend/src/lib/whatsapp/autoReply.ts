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
//
// Server-only — reads the message with the service-role client.

import { createAdminClient } from '@/lib/supabase/admin'

export const AUTO_REPLY_SETTING_KEY = 'whatsapp_auto_reply_message'

/** Meta's cap on a text message body. */
export const AUTO_REPLY_MAX_LENGTH = 4096

/**
 * Used when the settings row is missing or blank, so a bad edit or an unrun
 * migration can never leave the bot silent. Migration 014 seeds this same text.
 */
export const AUTO_REPLY_DEFAULT = [
  '📚 Spoken English Book வாங்க வேண்டுமா? 👉 9345639627',
  '📄 PDF / Online Class வேண்டுமா? 👉 6380513228',
].join('\n')

/**
 * Read per send rather than cached, which is what lets an admin edit take
 * effect on the very next inbound message with no redeploy. The cost is one
 * query, and the only caller runs inside `after()` — i.e. once the webhook has
 * already answered Meta — so it cannot slow the response down.
 *
 * Uses the service-role client because the webhook has no user session; the
 * cookie-based client would be blocked by RLS and silently return nothing.
 */
export async function getAutoReplyText(): Promise<string> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', AUTO_REPLY_SETTING_KEY)
    .maybeSingle()

  if (error) {
    console.error('[whatsapp] auto-reply text read failed', error.message)
    return AUTO_REPLY_DEFAULT
  }

  return data?.value?.trim() || AUTO_REPLY_DEFAULT
}
