import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { whatsappConfig } from '@/lib/whatsapp/config'

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
          from: message.from,
          type: message.type,
          text: message.text?.body,
        })
        // TODO: persist to Supabase / trigger auto-reply here.
      }

      for (const status of value.statuses ?? []) {
        console.log('[whatsapp-webhook] status update', {
          id: status.id,
          status: status.status,
          recipient: status.recipient_id,
        })
        // TODO: update message delivery status in Supabase here.
      }
    }
  }
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
        statuses?: Array<{
          id: string
          status: string
          timestamp: string
          recipient_id: string
        }>
      }
    }>
  }>
}
