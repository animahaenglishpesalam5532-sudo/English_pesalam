import { NextRequest, NextResponse, after } from 'next/server'
import crypto from 'crypto'
import { whatsappConfig } from '@/lib/whatsapp/config'
import { sendCtaUrl } from '@/lib/whatsapp/client'
import { AUTO_REPLY_CARD, claimAutoReply, markMessageSeen } from '@/lib/whatsapp/autoReply'
import { isMessageStatus, outranks } from '@/lib/whatsapp/status'
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
    handleEvent(payload)
  } catch (err) {
    // Never fail the response to Meta because of our own processing error,
    // or it will keep retrying. Log and move on.
    console.error('[whatsapp-webhook] processing error', err)
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
  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('whatsapp_messages')
    .select('id, status')
    .eq('message_id', status.id)
    .maybeSingle()

  // Sends made from another environment (or before logging existed) have no row.
  if (!existing) return
  if (isMessageStatus(existing.status) && !outranks(next, existing.status)) return

  const failure = status.errors?.[0]
  const error = failure
    ? [failure.code ? `(#${failure.code})` : '', failure.title, failure.message]
        .filter(Boolean)
        .join(' ')
    : null

  const { error: writeError } = await supabase
    .from('whatsapp_messages')
    .update({ status: next, ...(error ? { error } : {}) })
    .eq('id', existing.id)

  // Most likely cause is migration 010 not having been run, which would
  // otherwise fail the status check constraint without a trace.
  if (writeError) {
    console.error('[whatsapp-webhook] could not save status', next, writeError.message)
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
function handleEvent(payload: WhatsAppWebhookPayload) {
  if (payload.object !== 'whatsapp_business_account') return

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value

      for (const message of value.messages ?? []) {
        console.log('[whatsapp-webhook] incoming message', {
          from: message?.from,
          type: message?.type,
          text: message?.text?.body,
        })

        // Only inbound customer messages land in `messages`, so our own
        // outbound sends can never trigger this and cause a reply loop.
        if (!markMessageSeen(message?.id)) continue
        if (!claimAutoReply(message?.from)) continue

        queueAutoReply(message?.from)
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
 * Sends the canned reply after the 200 has already gone back to Meta.
 * Meta disables webhooks that answer slowly, so this must not block.
 */
function queueAutoReply(to?: string) {
  if (!to) return

  after(async () => {
    const result = await sendCtaUrl(to, AUTO_REPLY_CARD)

    if (result?.ok) {
      console.log('[whatsapp-webhook] auto-reply sent', { to, id: result?.messageId })
    } else {
      console.error('[whatsapp-webhook] auto-reply failed', { to, error: result?.error })
    }
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
        messages?: Array<{
          from: string
          id: string
          timestamp: string
          type: string
          text?: { body: string }
        }>
        statuses?: StatusEvent[]
      }
    }>
  }>
}
