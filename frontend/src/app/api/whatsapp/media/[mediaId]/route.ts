// Streams inbound WhatsApp media (voice notes, photos) to the inbox UI.
//
// SECURITY: this serves customer media straight from Meta with no RLS in
// front of it, so requireInboxAccess() is the only guard. Keep it first.

import { NextResponse } from 'next/server'
import { requireInboxAccess } from '@/lib/auth/roles'
import { fetchInboundMedia } from '@/lib/whatsapp/inboundMedia'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ERROR_STATUS: Record<string, number> = {
  // Gone, not "not found": the media aged out at Meta and will never return.
  expired: 410,
  unconfigured: 503,
  failed: 502,
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ mediaId: string }> }
) {
  try {
    await requireInboxAccess()
  } catch {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }

  const { mediaId } = await context.params
  if (!mediaId) return NextResponse.json({ error: 'Missing media id' }, { status: 400 })

  const { media, error } = await fetchInboundMedia(mediaId)
  if (!media) {
    return NextResponse.json({ error: error ?? 'failed' }, { status: ERROR_STATUS[error ?? ''] ?? 502 })
  }

  return new NextResponse(media.body, {
    headers: {
      'Content-Type': media.mime,
      ...(media.contentLength ? { 'Content-Length': media.contentLength } : {}),
      // Private: a shared cache must never hold one customer's voice note.
      'Cache-Control': 'private, max-age=300',
      'Content-Disposition': 'inline',
    },
  })
}
