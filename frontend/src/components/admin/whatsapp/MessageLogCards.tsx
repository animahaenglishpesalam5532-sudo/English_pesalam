'use client'

import React from 'react'
import { StatusBadge } from './MessageLogTable'
import { formatDateTime } from '@/lib/whatsapp/format'
import { formatPhone } from '@/lib/whatsapp/phone'
import { CARD } from './styles'
import type { WhatsAppMessageRecord } from '@/app/actions/whatsapp'

interface Props {
  rows: WhatsAppMessageRecord[]
  loading: boolean
  filtersActive: boolean
}

/** Mobile view of the sent-message log. */
export function MessageLogCards({ rows, loading, filtersActive }: Props) {
  if (loading) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${CARD} p-4`}>
            <div className="h-4 w-1/3 rounded bg-gray-100 animate-pulse" />
            <div className="mt-2 h-3 w-2/3 rounded bg-gray-100 animate-pulse" />
          </div>
        ))}
      </>
    )
  }

  if (!rows?.length) {
    return (
      <div className={`${CARD} p-8 text-center text-sm text-gray-500`}>
        {filtersActive ? 'No messages match these filters.' : 'No messages sent yet.'}
      </div>
    )
  }

  return (
    <>
      {rows.map((r) => (
        <div key={r.id} className={`${CARD} p-4`}>
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-semibold text-gray-900">{formatPhone(r.to_phone)}</span>
            <StatusBadge row={r} />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {r.template_name} · {r.template_language}
          </p>
          {r.body_preview && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-3">{r.body_preview}</p>
          )}
          {r.error && <p className="mt-2 text-xs text-red-600">{r.error}</p>}
          <p className="mt-2 text-xs text-gray-400">{formatDateTime(r.created_at)}</p>
        </div>
      ))}
    </>
  )
}
