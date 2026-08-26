'use client'

import React from 'react'
import { formatPhone } from '@/lib/whatsapp/phone'
import type { ConversationSummary } from '@/app/actions/whatsappInbox'

interface Props {
  conversation: ConversationSummary
  active: boolean
  onSelect: (id: string) => void
}

/** `14:05` today, `Yesterday`, otherwise `12 Mar` — WhatsApp's own scheme. */
function listTime(iso: string): string {
  const date = new Date(iso)
  if (!Number.isFinite(date.getTime())) return ''

  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  if (sameDay) {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function ConversationListItem({ conversation, active, onSelect }: Props) {
  const title =
    conversation?.customerName || conversation?.profileName || formatPhone(conversation?.phone)

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors ${
        active ? 'bg-emerald-50' : 'hover:bg-gray-50'
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
        {title?.charAt(0)?.toUpperCase() ?? '?'}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-semibold text-gray-900">{title}</span>
          <span className="shrink-0 text-[11px] text-gray-400">
            {listTime(conversation?.lastMessageAt)}
          </span>
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <span
            className={`truncate text-xs ${
              conversation?.unread ? 'font-semibold text-gray-800' : 'text-gray-500'
            }`}
          >
            {conversation?.lastDirection === 'outbound' && (
              <span className="text-gray-400">You: </span>
            )}
            {conversation?.lastMessagePreview || 'No preview'}
          </span>
          {conversation?.unread && (
            <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
          )}
        </span>
        {/* The name row wins when we know the customer, so the number would
            otherwise never be visible in the list. */}
        {(conversation?.customerName || conversation?.profileName) && (
          <span className="mt-0.5 block truncate text-[11px] text-gray-400">
            {formatPhone(conversation?.phone)}
          </span>
        )}
      </span>
    </button>
  )
}
