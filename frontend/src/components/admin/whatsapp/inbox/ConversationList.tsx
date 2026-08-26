'use client'

import React from 'react'
import { Search, MessageSquare } from 'lucide-react'
import { ConversationListItem } from './ConversationListItem'
import { FILTER_INPUT } from '../styles'
import type { ConversationSummary } from '@/app/actions/whatsappInbox'

interface Props {
  conversations: ConversationSummary[]
  selectedId: string | null
  search: string
  onSearch: (value: string) => void
  onSelect: (id: string) => void
}

export function ConversationList({
  conversations,
  selectedId,
  search,
  onSearch,
  onSelect,
}: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-gray-100 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search name or number"
            className={`${FILTER_INPUT} pl-9`}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <MessageSquare className="h-8 w-8 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No conversations yet</p>
            <p className="text-xs text-gray-400">
              A chat appears here the moment a customer replies to one of your messages.
            </p>
          </div>
        ) : (
          conversations.map((c) => (
            <ConversationListItem
              key={c.id}
              conversation={c}
              active={c.id === selectedId}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  )
}
