// The single write path into the inbox tables.
// Server-only — uses the service role.

import { createAdminClient } from '@/lib/supabase/admin'
import { customerPhoneCandidates } from './phone'
import { previewForMessage } from './preview'

export type MessageDirection = 'inbound' | 'outbound'
export type MessageOrigin = 'broadcast' | 'chat' | 'auto_reply' | 'inbound'

/** One message to file, plus the conversation facts it carries. */
export interface ConversationMessageInput {
  /** E.164 digits, no '+'. */
  phone: string
  direction: MessageDirection
  origin: MessageOrigin
  /** Meta's wamid. Null for a send Meta rejected outright. */
  messageId?: string | null
  type?: string
  body?: string | null
  mediaId?: string | null
  mediaMime?: string | null
  mediaSha256?: string | null
  mediaFilename?: string | null
  status?: string | null
  error?: string | null
  templateName?: string | null
  templateLanguage?: string | null
  sentBy?: string | null
  /** Meta's clock, ISO 8601. Falls back to now() in the database. */
  sentAt?: string | null
  /** WhatsApp display name, inbound only. */
  profileName?: string | null
  customerId?: string | null
}

export interface RecordMessagesResult {
  /**
   * The wamids that were genuinely new. Redelivered webhooks come back empty,
   * which is how the caller knows not to auto-reply a second time.
   */
  insertedMessageIds: string[]
  error?: string
}

/**
 * Upserts the conversations and inserts the messages in one round trip.
 *
 * All the ordering and idempotency logic lives in the SQL function
 * `whatsapp_record_messages` — see migration 012 for why this cannot be done
 * with PostgREST upserts.
 */
export async function recordMessages(
  rows: ConversationMessageInput[]
): Promise<RecordMessagesResult> {
  const payload = (rows ?? [])
    .filter((r) => r?.phone)
    .map((r) => ({
      phone: r.phone,
      direction: r.direction,
      origin: r.origin,
      message_id: r.messageId ?? null,
      type: r.type ?? 'text',
      body: r.body ?? null,
      media_id: r.mediaId ?? null,
      media_mime: r.mediaMime ?? null,
      media_sha256: r.mediaSha256 ?? null,
      media_filename: r.mediaFilename ?? null,
      status: r.status ?? null,
      error: r.error ?? null,
      template_name: r.templateName ?? null,
      template_language: r.templateLanguage ?? null,
      sent_by: r.sentBy ?? null,
      sent_at: r.sentAt ?? null,
      profile_name: r.profileName ?? null,
      customer_id: r.customerId ?? null,
      preview: previewForMessage({
        type: r.type,
        body: r.body,
        media_filename: r.mediaFilename,
      }),
    }))

  if (!payload.length) return { insertedMessageIds: [] }

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('whatsapp_record_messages', { p_rows: payload })

  if (error) {
    // Most likely cause is migration 012 not having been run.
    console.error('[whatsapp-inbox] could not record messages', error.message)
    return { insertedMessageIds: [], error: error.message }
  }

  return { insertedMessageIds: Array.isArray(data) ? data.filter(Boolean) : [] }
}

/**
 * Links a WhatsApp number to a sales-register customer, or null when it is a
 * stranger. Cheap enough to run on every inbound message: the SQL function
 * keeps the first non-null it is given and never overwrites it.
 */
export async function resolveCustomerId(phone: string): Promise<string | null> {
  const candidates = customerPhoneCandidates(phone)
  if (!candidates.length) return null

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('customers')
    .select('id')
    .in('phone', candidates)
    .limit(1)
    .maybeSingle()

  return data?.id ?? null
}

/**
 * True when this number is due an auto-reply. The claim is atomic and stored
 * in the database, so it holds across serverless instances — the old in-memory
 * Map let the same customer get the card again after every cold start.
 */
export async function claimAutoReply(phone: string): Promise<boolean> {
  if (!phone) return false

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('whatsapp_claim_auto_reply', { p_phone: phone })

  if (error) {
    console.error('[whatsapp-inbox] auto-reply claim failed', error.message)
    return false
  }
  return data === true
}
