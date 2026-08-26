// Turns a raw Cloud API webhook message into a row we can store.
//
// Only the fields we actually read are typed. Media is recorded by id and mime
// type only — nothing is downloaded yet.

import type { ConversationMessageInput } from './conversations'

interface MediaPayload {
  id?: string
  mime_type?: string
  sha256?: string
  caption?: string
  filename?: string
}

export interface InboundMessage {
  from?: string
  id?: string
  /** Unix seconds, as a string. */
  timestamp?: string
  type?: string
  text?: { body?: string }
  image?: MediaPayload
  video?: MediaPayload
  audio?: MediaPayload
  document?: MediaPayload
  sticker?: MediaPayload
  button?: { text?: string; payload?: string }
  interactive?: {
    type?: string
    button_reply?: { id?: string; title?: string }
    list_reply?: { id?: string; title?: string; description?: string }
  }
  reaction?: { emoji?: string; message_id?: string }
  location?: { latitude?: number; longitude?: number; name?: string; address?: string }
  errors?: Array<{ code?: number; title?: string; message?: string }>
}

export interface InboundContact {
  wa_id?: string
  profile?: { name?: string }
}

/**
 * Meta sends unix seconds as a string, in UTC. This must drive `sent_at` and
 * `last_inbound_at`: falling back to our own clock on a webhook that arrived
 * late would push the 24h window past its real expiry.
 */
export function metaTimestampToIso(timestamp?: string): string | null {
  const seconds = Number(timestamp)
  if (!Number.isFinite(seconds) || seconds <= 0) return null
  return new Date(seconds * 1000).toISOString()
}

/** The media sub-object for whichever type this message is, if any. */
function mediaOf(message: InboundMessage): MediaPayload | undefined {
  switch (message?.type) {
    case 'image':
      return message.image
    case 'video':
      return message.video
    case 'audio':
      return message.audio
    case 'document':
      return message.document
    case 'sticker':
      return message.sticker
    default:
      return undefined
  }
}

/** Whatever text the customer actually typed or tapped, if anything. */
function bodyOf(message: InboundMessage): string | null {
  switch (message?.type) {
    case 'text':
      return message.text?.body ?? null
    case 'button':
      return message.button?.text ?? null
    case 'interactive':
      return (
        message.interactive?.button_reply?.title ??
        message.interactive?.list_reply?.title ??
        null
      )
    case 'reaction':
      return message.reaction?.emoji ?? null
    case 'location':
      return message.location?.name ?? message.location?.address ?? null
    case 'unsupported':
      return message.errors?.[0]?.title ?? null
    default:
      return mediaOf(message)?.caption ?? null
  }
}

/**
 * Null when the payload is too malformed to file — no sender or no message id
 * means we cannot deduplicate it, and storing it would risk a duplicate on
 * Meta's next redelivery.
 */
export function parseInboundMessage(
  message: InboundMessage,
  contact?: InboundContact
): ConversationMessageInput | null {
  const phone = message?.from
  const messageId = message?.id
  if (!phone || !messageId) return null

  const media = mediaOf(message)

  return {
    phone,
    direction: 'inbound',
    origin: 'inbound',
    messageId,
    type: message?.type || 'text',
    body: bodyOf(message),
    mediaId: media?.id ?? null,
    mediaMime: media?.mime_type ?? null,
    mediaSha256: media?.sha256 ?? null,
    mediaFilename: media?.filename ?? null,
    sentAt: metaTimestampToIso(message?.timestamp),
    profileName: contact?.profile?.name ?? null,
  }
}
