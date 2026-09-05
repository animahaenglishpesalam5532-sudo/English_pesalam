'use client'

import React, { useState } from 'react'
import { Send, FileText } from 'lucide-react'

interface Props {
  /** False once Meta's 24h window has closed — only templates get through. */
  canReply: boolean
  sending: boolean
  onSend: (body: string) => void | Promise<void>
  onOpenTemplates: () => void
}

export function ChatComposer({ canReply, sending, onSend, onOpenTemplates }: Props) {
  const [body, setBody] = useState('')
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Auto-grow textarea as content grows, within min and max bounds
  React.useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
    const minHeight = isMobile ? 80 : 96
    const maxHeight = isMobile ? 208 : 288
    const nextHeight = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight)
    el.style.height = `${nextHeight}px`
  }, [body])

  const submit = async () => {
    const value = body.trim()
    if (!value || sending) return
    setBody('')
    if (textareaRef.current) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
      textareaRef.current.style.height = `${isMobile ? 80 : 96}px`
    }
    await onSend(value)
  }

  if (!canReply) {
    return (
      <div className="flex flex-col gap-2 border-t border-gray-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-4">
        <p className="text-xs text-gray-500">
          Free-text replies are disabled. Send a template to re-open the conversation.
        </p>
        <button
          type="button"
          onClick={onOpenTemplates}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <FileText className="h-4 w-4" /> Send template
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2 border-t border-gray-100 bg-white px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
      <button
        type="button"
        onClick={onOpenTemplates}
        aria-label="Send an approved template instead"
        title="Send an approved template instead"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
      >
        <FileText className="h-4 w-4" />
      </button>

      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          // Enter sends, Shift+Enter breaks the line — as in WhatsApp Web. Left
          // alone on touch devices, where Enter has to insert a newline because
          // there is no Shift to hold.
          if (e.key === 'Enter' && !e.shiftKey && !isTouch()) {
            e.preventDefault()
            submit()
          }
        }}
        rows={3}
        placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
        // text-base below sm: anything smaller makes iOS zoom the page in on
        // focus and it never zooms back out.
        className="min-h-[80px] max-h-52 flex-1 resize-y rounded-lg border border-gray-300 px-3.5 py-2.5 text-base text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:min-h-[96px] sm:max-h-72 sm:text-sm"
      />

      <button
        type="button"
        onClick={submit}
        disabled={sending || !body.trim()}
        aria-label="Send message"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  )
}

/** Phones have no Shift key on the soft keyboard, so Enter must break the line. */
function isTouch(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
}
