'use client'

import React from 'react'
import { PackageSearch } from 'lucide-react'
import { RowActions } from './RowActions'
import { booksLabel, formatDate } from '@/lib/bookTracking/format'
import { CARD } from './styles'
import type { BookTrackingRecord } from '@/app/actions/bookTracking'

interface Props {
  rows: BookTrackingRecord[]
  loading: boolean
  filtersActive: boolean
  canDelete: boolean
  deletingId: string | null
  onEdit: (row: BookTrackingRecord) => void
  onDelete: (row: BookTrackingRecord) => void
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd className="ml-auto text-right text-gray-900 break-all">{value}</dd>
    </div>
  )
}

/** Mobile view of the delivery records — the table does not fit on small screens. */
export function BookTrackingCards({
  rows,
  loading,
  filtersActive,
  canDelete,
  deletingId,
  onEdit,
  onDelete,
}: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${CARD} h-32 animate-pulse`} />
        ))}
      </div>
    )
  }

  if (rows?.length === 0) {
    return (
      <div className={`${CARD} p-8 text-center`}>
        <PackageSearch className="w-8 h-8 mx-auto text-gray-300" />
        <p className="mt-2 text-sm text-gray-500">
          {filtersActive ? 'No records match these filters.' : 'No records yet.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {rows?.map((r) => (
        <div key={r.id} className={`${CARD} p-4`}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-gray-400">
                #{r.serial_no} · {formatDate(r.created_at)}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900 truncate">{r.name}</p>
              <p className="text-sm text-gray-600">{r.phone}</p>
            </div>
            <RowActions
              row={r}
              canDelete={canDelete}
              deleting={deletingId === r.id}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
          <dl className="mt-3 space-y-1 text-sm">
            <Row label="WhatsApp ID" value={r.whatsapp_id} />
            <Row label="Tracking no." value={r.tracking_number} />
            <Row label="Books" value={booksLabel(r.items)} />
          </dl>
        </div>
      ))}
    </div>
  )
}
