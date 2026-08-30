'use client'

import React from 'react'
import { AlertTriangle, ImageIcon, Loader2, Mic } from 'lucide-react'
import { ImageLightbox } from './ImageLightbox'

type State = 'idle' | 'loading' | 'ready' | 'expired' | 'failed'

/** Types we can render inline. Everything else keeps its text placeholder. */
export type PlayableKind = 'audio' | 'image'

const IDLE_LABEL: Record<PlayableKind, string> = {
  audio: 'Play voice message',
  image: 'Show photo',
}

const GONE_LABEL: Record<PlayableKind, string> = {
  audio: 'This voice message is no longer available on WhatsApp.',
  image: 'This photo is no longer available on WhatsApp.',
}

/**
 * Renders customer-sent media through our own proxy — Meta's media URL only
 * serves bytes with the access token attached, which a browser cannot send.
 *
 * Loads on click rather than on render for two reasons: opening a thread would
 * otherwise fire a Graph round trip per attachment, and fetching by hand (as
 * opposed to letting the browser do it) is the only way to tell an expired
 * media ID apart from a real failure, since onError hides the status code.
 */
export function MediaMessage({ mediaId, kind }: { mediaId: string; kind: PlayableKind }) {
  const [state, setState] = React.useState<State>('idle')
  const [src, setSrc] = React.useState<string | null>(null)
  const [zoomed, setZoomed] = React.useState(false)

  // Object URLs are held until revoked, and a thread can mount many bubbles.
  React.useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src)
    }
  }, [src])

  async function load() {
    setState('loading')
    try {
      const res = await fetch(`/api/whatsapp/media/${encodeURIComponent(mediaId)}`)
      if (res?.status === 410) {
        setState('expired')
        return
      }
      if (!res?.ok) {
        setState('failed')
        return
      }
      setSrc(URL.createObjectURL(await res.blob()))
      setState('ready')
    } catch {
      setState('failed')
    }
  }

  if (state === 'ready' && src) {
    if (kind === 'image') {
      return (
        <>
          <button type="button" onClick={() => setZoomed(true)} className="block">
            {/* Plain <img>: a blob URL is client-only and short lived, so
                next/image has nothing to optimise here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="Photo sent by the customer"
              className="mt-1 max-h-72 w-auto max-w-full cursor-zoom-in rounded-lg"
            />
          </button>
          <ImageLightbox src={src} open={zoomed} onClose={() => setZoomed(false)} />
        </>
      )
    }
    return <audio controls autoPlay src={src} className="mt-1 h-10 w-56 max-w-full" />
  }

  if (state === 'expired') {
    return (
      <p className="mt-1 flex items-start gap-1 text-[11px] text-gray-500">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {GONE_LABEL[kind]}
      </p>
    )
  }

  const Icon = kind === 'image' ? ImageIcon : Mic

  return (
    <button
      type="button"
      onClick={load}
      disabled={state === 'loading'}
      className="mt-1 flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-60"
    >
      {state === 'loading' ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
      {state === 'failed'
        ? 'Could not load — retry'
        : state === 'loading'
          ? 'Loading…'
          : IDLE_LABEL[kind]}
    </button>
  )
}
