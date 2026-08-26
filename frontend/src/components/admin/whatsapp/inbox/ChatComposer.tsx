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

  const submit = async () => {
    const value = body.trim()
    if (!value || sending) return
    setBody('')
    await onSend(value)
  }

  if (!canReply) {
    return (
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
        <p className="text-xs text-gray-500">
          Free-text replies are disabled. Send a template to re-open the conversation.
        </p>
        <button
          type="button"
          onClick={onOpenTemplates}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <FileText className="h-4 w-4" /> Send template
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2 border-t border-gray-100 px-3 py-3">
      <button
        type="button"
        onClick={onOpenTemplates}
        title="Send an approved template instead"
        className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-50"
      >
        <FileText className="h-4 w-4" />
      </button>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          // Enter sends, Shift+Enter breaks the line — as in WhatsApp Web.
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
        rows={1}
        placeholder="Type a message"
        className="max-h-32 min-h-[40px] flex-1 resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <button
        type="button"
        onClick={submit}
        disabled={sending || !body.trim()}
        className="shrink-0 rounded-lg bg-emerald-600 p-2.5 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  )
}
