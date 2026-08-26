'use client'

import React, { useEffect, useRef } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { WindowBanner } from './WindowBanner'
import { ChatComposer } from './ChatComposer'
import { formatPhone } from '@/lib/whatsapp/phone'
import { isWindowOpen } from '@/lib/whatsapp/window'
import type { ConversationSummary, ThreadMessage } from '@/app/actions/whatsappInbox'

interface Props {
  conversation: ConversationSummary
  messages: ThreadMessage[]
  hasMore: boolean
  loading: boolean
  sending: boolean
  windowClosed: boolean
  error: string
  onLoadOlder: () => void
  onSend: (body: string) => void | Promise<void>
  onOpenTemplates: () => void
  onBack: () => void
}

/** `Mon, 12 Mar` separators between days, as in WhatsApp. */
function dayLabel(iso: string): string {
  const date = new Date(iso)
  if (!Number.isFinite(date.getTime())) return ''
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  })
}

export function ChatThread({
  conversation,
  messages,
  hasMore,
  loading,
  sending,
  windowClosed,
  error,
  onLoadOlder,
  onSend,
  onOpenTemplates,
  onBack,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null)

  // Jump to the newest message whenever the thread changes or one is sent.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [conversation.id, messages.length])

  const title =
    conversation?.customerName || conversation?.profileName || formatPhone(conversation?.phone)
  const canReply = isWindowOpen(conversation?.lastInboundAt) && !windowClosed

  let lastDay = ''

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
          {title?.charAt(0)?.toUpperCase() ?? '?'}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{title}</p>
          <p className="truncate text-xs text-gray-500">{formatPhone(conversation?.phone)}</p>
        </div>
      </div>

      <WindowBanner lastInboundAt={conversation?.lastInboundAt} forcedClosed={windowClosed} />

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-gray-50 px-4 py-4">
        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        )}

        {!loading && hasMore && (
          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={onLoadOlder}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              Load older messages
            </button>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <p className="py-10 text-center text-xs text-gray-400">No messages in this thread yet.</p>
        )}

        {messages.map((m) => {
          const day = dayLabel(m.sentAt)
          const showDay = day !== lastDay
          lastDay = day
          return (
            <React.Fragment key={m.id}>
              {showDay && (
                <div className="flex justify-center py-2">
                  <span className="rounded-full bg-white px-3 py-0.5 text-[10px] font-medium text-gray-500 shadow-sm">
                    {day}
                  </span>
                </div>
              )}
              <MessageBubble message={m} />
            </React.Fragment>
          )
        })}

        <div ref={endRef} />
      </div>

      {error && (
        <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">{error}</p>
      )}

      <ChatComposer
        canReply={canReply}
        sending={sending}
        onSend={onSend}
        onOpenTemplates={onOpenTemplates}
      />
    </div>
  )
}
