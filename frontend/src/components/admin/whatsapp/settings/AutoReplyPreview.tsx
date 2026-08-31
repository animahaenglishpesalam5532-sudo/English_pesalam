'use client'

import React from 'react'

// Roughly what WhatsApp itself linkifies: a run of digits long enough to be a
// phone number, allowing the spaces, dashes, brackets and '+' people type.
const PHONE = /(\+?\d[\d\s\-()]{7,}\d)/g

/** Splits the text so detected phone numbers render the way WhatsApp shows them. */
function linkifyPhones(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let cursor = 0

  for (const match of text.matchAll(PHONE)) {
    const start = match.index ?? 0
    if (start > cursor) parts.push(text.slice(cursor, start))
    parts.push(
      <span key={start} className="text-[#00a5f4] underline">
        {match[0]}
      </span>
    )
    cursor = start + match[0].length
  }

  if (cursor < text.length) parts.push(text.slice(cursor))
  return parts
}

/**
 * Chat-bubble rendering of the message exactly as the customer receives it.
 *
 * Every colour here is a literal hex rather than a `gray-*`/`emerald-*` class,
 * because the admin dark theme in globals.css remaps those by class name. A
 * preview that follows the admin's theme is not a preview — WhatsApp always
 * shows this on its own light background.
 */
export function AutoReplyPreview({ message }: { message: string }) {
  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="rounded-lg bg-[#e5ddd5] p-4">
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-xl bg-[#d9fdd3] px-3 py-2 shadow-sm sm:max-w-[70%]">
          {message?.trim() ? (
            <p className="whitespace-pre-wrap break-words text-sm text-[#111b21]">
              {linkifyPhones(message)}
            </p>
          ) : (
            <p className="text-sm italic text-[#667781]">Nothing to preview yet</p>
          )}

          <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-[#667781]">
            <span>{time}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
