'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface Props {
  src: string
  open: boolean
  onClose: () => void
}

/** Full-size view of an inbox photo. Backdrop, close button and Escape all dismiss. */
export function ImageLightbox({ src, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10"
      >
        <X className="h-5 w-5" />
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Photo sent by the customer"
        // A click on the photo itself must not fall through to the backdrop.
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90dvh] max-w-full rounded-lg object-contain"
      />
    </div>
  )
}
