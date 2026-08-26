'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, MessageSquare } from 'lucide-react'
import { ConversationList } from './ConversationList'
import { ChatThread } from './ChatThread'
import { TemplateSendModal } from './TemplateSendModal'
import { useInbox } from './useInbox'
import { CARD } from '../styles'
import type { ConversationSummary } from '@/app/actions/whatsappInbox'

interface Props {
  initialConversations: ConversationSummary[]
}

export default function InboxShell({ initialConversations }: Props) {
  const inbox = useInbox(initialConversations)
  const [templatesOpen, setTemplatesOpen] = useState(false)

  const list = (
    <ConversationList
      conversations={inbox.conversations}
      selectedId={inbox.selectedId}
      search={inbox.search}
      onSearch={inbox.setSearch}
      onSelect={inbox.select}
    />
  )

  const thread = inbox.selected ? (
    <ChatThread
      conversation={inbox.selected}
      messages={inbox.messages}
      hasMore={inbox.hasMore}
      loading={inbox.loadingThread}
      sending={inbox.sending}
      windowClosed={inbox.windowClosed}
      error={inbox.error}
      onLoadOlder={inbox.loadOlder}
      onSend={inbox.send}
      onOpenTemplates={() => setTemplatesOpen(true)}
      onBack={inbox.back}
    />
  ) : (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      <MessageSquare className="h-8 w-8 text-gray-300" />
      <p className="text-sm font-medium text-gray-500">Pick a conversation</p>
      <p className="text-xs text-gray-400">
        Replies land here automatically. Press Refresh to check for new ones.
      </p>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-0 flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/whatsapp"
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="truncate text-xl font-bold text-gray-900">Inbox</h1>
          </div>
          <p className="mt-1 hidden text-sm text-gray-500 sm:block">
            Customers who have replied to you. New messages arrive in the background — press
            Refresh to pull them in.
          </p>
        </div>

        <button
          type="button"
          onClick={inbox.refreshAll}
          disabled={inbox.refreshing}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${inbox.refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Mobile: one pane at a time, swapped by selection — not two rendered
          copies, which would run every effect twice. */}
      <div className={`${CARD} min-h-0 flex-1 overflow-hidden md:hidden`}>
        {inbox.selectedId ? thread : list}
      </div>

      <div className={`${CARD} hidden min-h-0 flex-1 overflow-hidden md:flex`}>
        <div className="w-80 shrink-0 border-r border-gray-100">{list}</div>
        <div className="min-w-0 flex-1">{thread}</div>
      </div>

      <TemplateSendModal
        open={templatesOpen}
        sending={inbox.sending}
        onClose={() => setTemplatesOpen(false)}
        onSend={async (template, variables) => {
          const ok = await inbox.sendTemplate(template, variables)
          if (ok) setTemplatesOpen(false)
        }}
      />
    </div>
  )
}
