// Thin wrapper around the WhatsApp Cloud API "messages" endpoint.
// Server-only — never import this from a client component, it uses the token.

import { whatsappConfig } from './config'

export interface SendResult {
  ok: boolean
  /** Meta's message id (wamid...) when the send was accepted. */
  messageId?: string
  error?: string
}

function messagesUrl(): string {
  const { graphApiVersion, phoneNumberId } = whatsappConfig
  return `https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages`
}

export interface CtaUrlMessage {
  header?: string
  body: string
  footer?: string
  /** Label on the button, e.g. "Buy Now". Max 20 characters. */
  buttonText: string
  buttonUrl: string
}

/**
 * Sends a plain text message. Only allowed inside the 24h customer service
 * window (i.e. the customer messaged us first) — outside it Meta rejects the
 * send and a pre-approved template must be used instead.
 */
export async function sendText(to: string, body: string): Promise<SendResult> {
  return send({
    to,
    type: 'text',
    text: { preview_url: false, body },
  })
}

/**
 * Sends an interactive card with a single URL button.
 *
 * Unlike message templates, `wa.me` links ARE permitted here, so the button can
 * drop the customer straight into a chat with the sales number. Session-only:
 * requires the 24h window to be open.
 */
export async function sendCtaUrl(to: string, message: CtaUrlMessage): Promise<SendResult> {
  return send({
    to,
    type: 'interactive',
    interactive: {
      type: 'cta_url',
      ...(message?.header ? { header: { type: 'text', text: message.header } } : {}),
      body: { text: message?.body },
      ...(message?.footer ? { footer: { text: message.footer } } : {}),
      action: {
        name: 'cta_url',
        parameters: { display_text: message?.buttonText, url: message?.buttonUrl },
      },
    },
  })
}

/** Shared POST to the messages endpoint. */
async function send(payload: Record<string, unknown>): Promise<SendResult> {
  const { accessToken, phoneNumberId } = whatsappConfig

  if (!accessToken || !phoneNumberId) {
    return { ok: false, error: 'WhatsApp credentials are not configured' }
  }

  try {
    const res = await fetch(messagesUrl(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        ...payload,
      }),
    })

    const json = await res.json().catch(() => null)

    if (!res.ok) {
      return { ok: false, error: json?.error?.message ?? `HTTP ${res.status}` }
    }

    return { ok: true, messageId: json?.messages?.[0]?.id }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
