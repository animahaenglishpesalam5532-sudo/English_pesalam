'use client'

import React from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { TableSkeleton } from '../TableUI'
import { RowActions } from './RowActions'
import { booksLabel, formatDate } from '@/lib/bookTracking/format'
import type { BookTrackingRecord } from '@/app/actions/bookTracking'

const TOTAL_COLS = 8

interface Props {
  rows: BookTrackingRecord[]
  loading: boolean
  filtersActive: boolean
  canDelete: boolean
  deletingId: string | null
  sortBy?: 'created_at' | 'whatsapp_id'
  sortOrder?: 'asc' | 'desc'
  onToggleSort?: (column: 'created_at' | 'whatsapp_id') => void
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
  sortBy,
  sortOrder,
  onToggleSort,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              <button
                type="button"
                onClick={() => onToggleSort?.('whatsapp_id')}
                className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                title="Click to sort by WhatsApp ID"
              >
                <span>WhatsApp ID</span>
                {sortBy === 'whatsapp_id' ? (
                  sortOrder === 'asc' ? (
                    <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                  )
                ) : (
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Phone
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Courier
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Tracking No.
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Books
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>
        {loading ? (
          <TableSkeleton cols={TOTAL_COLS} />
        ) : (
          <tbody className="divide-y divide-gray-100">
            {rows?.length === 0 ? (
              <tr>
                <td colSpan={TOTAL_COLS} className="px-4 py-10 text-center text-sm text-gray-500">
                  {filtersActive ? 'No records match these filters.' : 'No records yet.'}
                </td>
              </tr>
            ) : (
              rows?.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(r.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {r.whatsapp_id}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {r.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{r.phone}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {r.courier_name ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {r.courier_name}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap font-mono">
                    {r.tracking_number}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate"
                    title={booksLabel(r.items)}
                  >
                    {booksLabel(r.items)}
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
