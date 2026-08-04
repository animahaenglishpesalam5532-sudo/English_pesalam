'use client'

import React from 'react'
import { TableSkeleton } from '../TableUI'
import { RowActions } from './RowActions'
import { booksLabel, formatDate } from '@/lib/bookTracking/format'
import type { BookTrackingRecord } from '@/app/actions/bookTracking'

const HEADERS = ['S.No', 'WhatsApp ID', 'Name', 'Phone', 'Tracking No.', 'Books', 'Date', '']

interface Props {
  rows: BookTrackingRecord[]
  loading: boolean
  filtersActive: boolean
  canDelete: boolean
  deletingId: string | null
  onEdit: (row: BookTrackingRecord) => void
  onDelete: (row: BookTrackingRecord) => void
}

/** Desktop view of the delivery records. */
export function BookTrackingTable({
  rows,
  loading,
  filtersActive,
  canDelete,
  deletingId,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            {HEADERS?.map((h, i) => (
              <th
                key={h || `col-${i}`}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        {loading ? (
          <TableSkeleton cols={HEADERS.length} />
        ) : (
          <tbody className="divide-y divide-gray-100">
            {rows?.length === 0 ? (
              <tr>
                <td colSpan={HEADERS.length} className="px-4 py-10 text-center text-sm text-gray-500">
                  {filtersActive ? 'No records match these filters.' : 'No records yet.'}
                </td>
              </tr>
            ) : (
              rows?.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">#{r.serial_no}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{r.whatsapp_id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{r.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{r.phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{r.tracking_number}</td>
                  <td
                    className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate"
                    title={booksLabel(r.items)}
                  >
                    {booksLabel(r.items)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(r.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RowActions
                      row={r}
                      canDelete={canDelete}
                      deleting={deletingId === r.id}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
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
