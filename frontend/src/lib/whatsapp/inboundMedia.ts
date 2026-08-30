// Downloads media a customer sent us, so the inbox can play it.
// Server-only — uses the access token.
//
// Two hops are required. The media ID resolves to a short-lived download URL,
// and that URL still only serves bytes when the access token is attached. A
// browser cannot send that header, which is why every play goes through the
// /api/whatsapp/media proxy instead of pointing <audio> straight at Meta.
//
// LIFETIME: media IDs that arrive on a webhook are only downloadable for a
// limited window — Meta documents 7 days for webhook-sourced IDs, shorter than
// the 30 days that applies to IDs we get back from our own uploads (see
// media.ts). Past that, Graph 404s and there is no way to recover the audio;
// the caller turns that into a 410 so the UI can say so plainly. Nothing is
// cached on our side today.

import { whatsappConfig } from './config'

export interface InboundMedia {
  body: ReadableStream<Uint8Array> | null
  mime: string
  contentLength: string | null
}

/** `expired` is the ordinary end of life for old media, not a fault. */
export type InboundMediaError = 'unconfigured' | 'expired' | 'failed'

interface MediaLookup {
  url?: string
  mime_type?: string
  file_size?: number
}

export async function fetchInboundMedia(
  mediaId: string
): Promise<{ media?: InboundMedia; error?: InboundMediaError }> {
  const { accessToken, graphApiVersion } = whatsappConfig
  if (!accessToken) return { error: 'unconfigured' }

  // lookaside.fbsbx.com rejects requests without a User-Agent, so send one on
  // both hops rather than debugging an opaque 400 later.
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'User-Agent': 'EnglishPesalamInbox/1.0',
  }

  try {
    const lookup = await fetch(
      `https://graph.facebook.com/${graphApiVersion}/${encodeURIComponent(mediaId)}`,
      { headers, cache: 'no-store' }
    )
    const meta = (await lookup.json().catch(() => null)) as MediaLookup | null

    if (!lookup.ok || !meta?.url) {
      if (lookup.status === 404) return { error: 'expired' }
      console.error('[whatsapp-media] lookup failed', lookup.status)
      return { error: 'failed' }
    }

    const download = await fetch(meta.url, { headers, cache: 'no-store' })
    if (!download.ok) {
      if (download.status === 404) return { error: 'expired' }
      console.error('[whatsapp-media] download failed', download.status)
      return { error: 'failed' }
    }

    return {
      media: {
        body: download.body,
        mime:
          meta?.mime_type ?? download.headers.get('content-type') ?? 'application/octet-stream',
        contentLength: download.headers.get('content-length'),
      },
    }
  } catch (err) {
    console.error('[whatsapp-media] fetch error', err)
    return { error: 'failed' }
  }
}
