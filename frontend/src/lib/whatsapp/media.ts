// Resolves the media ID to send for a template's image/video/document header.
// Server-only — uses the access token and the service-role Supabase client.

import { createAdminClient } from '@/lib/supabase/admin'
import { whatsappConfig } from './config'
import { templateHeaderMedia, type WhatsAppTemplate } from './templates'

// Meta expires uploaded media after 30 days; refresh well before that so a
// long-running broadcast can never straddle the boundary.
const MAX_AGE_DAYS = 25

/**
 * Uploads the template's own header image to Meta and returns the media ID,
 * reusing a cached upload when one is still valid.
 *
 * Sending `{ id }` instead of `{ link }` matters: Meta will not reliably
 * download from the scontent.whatsapp.net handle it hands out with the
 * template, and a failed download surfaces as (#131053) Media upload error.
 *
 * Returns undefined if the template has no media header or the upload fails —
 * the caller falls back to the link so a send is never blocked outright.
 */
export async function resolveHeaderMediaId(
  template: WhatsAppTemplate
): Promise<string | undefined> {
  const sourceUrl = templateHeaderMedia(template)
  if (!sourceUrl) return undefined

  const supabase = createAdminClient()

  const { data: cached } = await supabase
    .from('whatsapp_template_media')
    .select('media_id, source_url, uploaded_at')
    .eq('template_name', template.name)
    .maybeSingle()

  if (cached && isFresh(cached.uploaded_at) && sameAsset(cached.source_url, sourceUrl)) {
    return cached.media_id
  }

  const mediaId = await uploadFromUrl(sourceUrl)
  if (!mediaId) return undefined

  await supabase.from('whatsapp_template_media').upsert({
    template_name: template.name,
    media_id: mediaId,
    source_url: sourceUrl,
    uploaded_at: new Date().toISOString(),
  })

  return mediaId
}

function isFresh(uploadedAt: string): boolean {
  const age = Date.now() - new Date(uploadedAt).getTime()
  return age < MAX_AGE_DAYS * 24 * 60 * 60 * 1000
}

/**
 * scontent URLs are re-signed on every template fetch, so compare the stable
 * path rather than the query string, which changes constantly.
 */
function sameAsset(a: string | null, b: string): boolean {
  if (!a) return false
  try {
    return new URL(a).pathname === new URL(b).pathname
  } catch {
    return a === b
  }
}

async function uploadFromUrl(url: string): Promise<string | undefined> {
  const { accessToken, phoneNumberId, graphApiVersion } = whatsappConfig
  if (!accessToken || !phoneNumberId) return undefined

  try {
    const download = await fetch(url, { cache: 'no-store' })
    if (!download.ok) {
      console.error('[whatsapp-media] could not download template image', download.status)
      return undefined
    }

    const contentType = download.headers.get('content-type') ?? 'image/jpeg'
    const blob = new Blob([await download.arrayBuffer()], { type: contentType })

    const form = new FormData()
    form.append('messaging_product', 'whatsapp')
    form.append('type', contentType)
    form.append('file', blob, 'header')

    const res = await fetch(
      `https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/media`,
      { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` }, body: form }
    )
    const json = await res.json().catch(() => null)

    if (!res.ok || !json?.id) {
      console.error('[whatsapp-media] upload failed', json?.error?.message ?? res.status)
      return undefined
    }

    return String(json.id)
  } catch (err) {
    console.error('[whatsapp-media] upload error', err)
    return undefined
  }
}
