'use client'

import React from 'react'
import { TableSkeleton } from '../TableUI'
import { formatDateTime } from '@/lib/whatsapp/format'
import { formatPhone } from '@/lib/whatsapp/phone'
import type { WhatsAppMessageRecord } from '@/app/actions/whatsapp'

const TOTAL_COLS = 5

export function StatusBadge({ row }: { row: WhatsAppMessageRecord }) {
  const sent = row.status === 'sent'
  return (
    <span
      title={row.error ?? undefined}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
        sent
          ? 'bg-green-50 text-green-700 border-green-200'
          : 'bg-red-50 text-red-700 border-red-200'
      }`}
    >
      {sent ? 'Sent' : 'Failed'}
    </span>
  )
}

interface Props {
  rows: WhatsAppMessageRecord[]
  loading: boolean
  filtersActive: boolean
}

/** Desktop view of the sent-message log. */
export function MessageLogTable({ rows, loading, filtersActive }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            {['Date & Time', 'To', 'Template', 'Message', 'Status'].map((label) => (
              <th
                key={label}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        {loading ? (
          <TableSkeleton cols={TOTAL_COLS} />
        ) : (
          <tbody className="divide-y divide-gray-100">
            {rows?.length === 0 ? (
              <tr>
                <td colSpan={TOTAL_COLS} className="px-4 py-10 text-center text-sm text-gray-500">
                  {filtersActive ? 'No messages match these filters.' : 'No messages sent yet.'}
                </td>
              </tr>
            ) : (
              rows?.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {formatDateTime(r.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {formatPhone(r.to_phone)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {r.template_name}
                    <span className="ml-1.5 text-xs text-gray-400">{r.template_language}</span>
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-gray-600 max-w-md truncate"
                    title={r.body_preview ?? ''}
                  >
                    {r.body_preview || '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge row={r} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        )}
      </table>
    </div>
  )
}
