import { NextRequest, NextResponse, after } from 'next/server'
import crypto from 'crypto'
import { whatsappConfig } from '@/lib/whatsapp/config'
import { sendText } from '@/lib/whatsapp/client'
import { AUTO_REPLY_TEXT } from '@/lib/whatsapp/autoReply'
import { isMessageStatus, outranks, type MessageStatus } from '@/lib/whatsapp/status'
import {
  claimAutoReply,
  recordMessages,
  resolveCustomerId,
  type ConversationMessageInput,
} from '@/lib/whatsapp/conversations'
import {
  parseInboundMessage,
  type InboundContact,
  type InboundMessage,
} from '@/lib/whatsapp/inbound'
import { createAdminClient } from '@/lib/supabase/admin'

interface StatusEvent {
  id: string
  status: string
  timestamp: string
  recipient_id: string
  errors?: Array<{ code?: number; title?: string; message?: string }>
}

// Meta calls the webhook from its own servers, so this route must run on the
// Node.js runtime (needs `crypto`) and never be statically cached.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/webhook
 * Meta's verification handshake. When you click "Verify and save" in the
 * App Dashboard, Meta sends hub.mode=subscribe, hub.verify_token=<your token>
 * and hub.challenge=<random>. We echo the challenge back as plain text only if
 * the token matches WHATSAPP_VERIFY_TOKEN.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const mode = params.get('hub.mode')
  const token = params.get('hub.verify_token')
  const challenge = params.get('hub.challenge')

  if (mode === 'subscribe' && token === whatsappConfig.verifyToken) {
    return new NextResponse(challenge ?? '', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  // Token mismatch or malformed request.
  return new NextResponse('Forbidden', { status: 403 })
}

/**
 * POST /api/webhook
 * Receives incoming messages and status updates. Must return 200 quickly,
 * otherwise Meta retries and eventually disables the subscription.
 */
export async function POST(req: NextRequest) {
  // Read the raw body first — signature is computed over the exact bytes.
  const rawBody = await req.text()

  if (!verifySignature(req, rawBody)) {
    return new NextResponse('Invalid signature', { status: 401 })
  }

  let payload: WhatsAppWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new NextResponse('Bad Request', { status: 400 })
  }

  try {
    await handleEvent(payload)
  } catch (err) {
    // Persistence is awaited rather than deferred: once we answer 200 Meta
    // never redelivers, so anything dropped after that point is lost forever.
    // Returning 500 asks Meta to retry, which is safe because every insert is
    // idempotent on the message id.
    console.error('[whatsapp-webhook] processing error', err)
    return new NextResponse('Processing error', { status: 500 })
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

/**
 * Writes Meta's real delivery outcome onto the logged message. Without this the
 * admin log would keep claiming "sent" for messages Meta accepted and then
 * dropped, which is exactly what a marketing frequency cap looks like.
 */
async function recordStatus(status: StatusEvent) {
  if (!status?.id || !isMessageStatus(status.status)) return

  const next = status.status
  const failure = status.errors?.[0]
  const error = failure
    ? [failure.code ? `(#${failure.code})` : '', failure.title, failure.message]
        .filter(Boolean)
        .join(' ')
    : null

  // Two independent lookups rather than one driving the other: a broadcast
  // exists in both tables, but an auto-reply or an in-chat message only exists
  // in the thread.
  await Promise.all([
    promoteStatus('whatsapp_messages', status.id, next, error),
    promoteStatus('whatsapp_conversation_messages', status.id, next, error),
  ])
}

/** Applies a status to one table, refusing to move it backwards. */
async function promoteStatus(
  table: 'whatsapp_messages' | 'whatsapp_conversation_messages',
  messageId: string,
  next: MessageStatus,
  error: string | null
) {
  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from(table)
    .select('id, status')
    .eq('message_id', messageId)
    .maybeSingle()

  // Sends made from another environment (or before logging existed) have no row.
  if (!existing) return
  if (isMessageStatus(existing.status) && !outranks(next, existing.status)) return

  const { error: writeError } = await supabase
    .from(table)
    .update({ status: next, ...(error ? { error } : {}) })
    .eq('id', existing.id)

  // Most likely cause is migration 010 or 012 not having been run, which would
  // otherwise fail the status check constraint without a trace.
  if (writeError) {
    console.error('[whatsapp-webhook] could not save status', table, next, writeError.message)
  }
}

/**
 * Validates the X-Hub-Signature-256 header using the App Secret.
 * Skipped only if WHATSAPP_APP_SECRET is not configured yet (dev convenience).
 */
function verifySignature(req: NextRequest, rawBody: string): boolean {
  if (!whatsappConfig.appSecret) {
    console.warn('[whatsapp-webhook] WHATSAPP_APP_SECRET not set — skipping signature check')
    return true
  }

  const header = req.headers.get('x-hub-signature-256')
  if (!header?.startsWith('sha256=')) return false

  const expected = crypto
    .createHmac('sha256', whatsappConfig.appSecret)
    .update(rawBody)
    .digest('hex')

  const received = header.slice('sha256='.length)

  // Constant-time compare to avoid timing attacks; guard against length diff.
  const a = Buffer.from(received, 'hex')
  const b = Buffer.from(expected, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/** Walks the webhook payload and dispatches messages / statuses. */
async function handleEvent(payload: WhatsAppWebhookPayload) {
  if (payload.object !== 'whatsapp_business_account') return

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value

      // Only inbound customer messages land in `messages`, so our own outbound
      // sends can never trigger this and cause a reply loop.
      if (value.messages?.length) {
        await storeInbound(value.messages, value.contacts)
      }

      for (const status of value.statuses ?? []) {
        console.log('[whatsapp-webhook] status update', {
          id: status.id,
          status: status.status,
          recipient: status.recipient_id,
          error: status.errors?.[0]?.title,
        })

        after(recordStatus(status))
      }
    }
  }
}

/**
 * Files every inbound message in the change, then auto-replies to the senders
 * whose messages were genuinely new.
 */
async function storeInbound(messages: InboundMessage[], contacts?: InboundContact[]) {
  const rows: ConversationMessageInput[] = []

  for (const message of messages) {
    console.log('[whatsapp-webhook] incoming message', {
      from: message?.from,
      type: message?.type,
      text: message?.text?.body,
    })

    // One change can carry several senders, so match on wa_id rather than
    // assuming contacts[0] describes every message.
    const contact = contacts?.find((c) => c?.wa_id === message?.from) ?? undefined
    const row = parseInboundMessage(message, contact)
    if (row) rows.push(row)
  }

  if (!rows.length) return

  // Only worth looking up once per sender, and only for senders we might not
  // know yet — the SQL keeps the first non-null customer id it is given.
  const senders = Array.from(new Set(rows.map((r) => r.phone)))
  const customerIds = await Promise.all(senders.map((phone) => resolveCustomerId(phone)))
  const customerByPhone = new Map(senders.map((phone, i) => [phone, customerIds[i]]))
  for (const row of rows) row.customerId = customerByPhone.get(row.phone) ?? null

  const { insertedMessageIds, error } = await recordMessages(rows)
  if (error) throw new Error(error)

  // A redelivery inserts nothing, which is exactly how we avoid replying twice.
  const freshSenders = new Set(
    rows.filter((r) => r.messageId && insertedMessageIds.includes(r.messageId)).map((r) => r.phone)
  )
  for (const phone of freshSenders) queueAutoReply(phone)
}

/**
 * Sends the canned reply after the 200 has already gone back to Meta.
 * Meta disables webhooks that answer slowly, so this must not block.
 */
function queueAutoReply(to: string) {
  after(async () => {
    // Atomic 24h claim in the database, so two instances cannot both send.
    if (!(await claimAutoReply(to))) return

    const result = await sendText(to, AUTO_REPLY_TEXT)

    if (!result?.ok) {
      console.error('[whatsapp-webhook] auto-reply failed', { to, error: result?.error })
      return
    }

    console.log('[whatsapp-webhook] auto-reply sent', { to, id: result?.messageId })

    // Record it so the admin sees what the bot already told this customer.
    await recordMessages([
      {
        phone: to,
        direction: 'outbound',
        origin: 'auto_reply',
        messageId: result.messageId ?? null,
        type: 'text',
        body: AUTO_REPLY_TEXT,
        status: 'sent',
      },
    ])
  })
}

// ── Minimal payload types (only the fields we touch) ────────────────────────
interface WhatsAppWebhookPayload {
  object: string
  entry?: Array<{
    id: string
    changes?: Array<{
      field: string
      value: {
        messaging_product?: string
        metadata?: { display_phone_number: string; phone_number_id: string }
        contacts?: InboundContact[]
        messages?: InboundMessage[]
        statuses?: StatusEvent[]
      }
    }>
  }>
}
