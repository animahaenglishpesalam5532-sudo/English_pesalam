'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const PAGE_SIZES = [10, 25, 50, 100]

export function TableSkeleton({ cols, rows = 8 }: { cols: number; rows?: number }) {
  return (
    <tbody className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <div className="h-4 rounded bg-gray-100 animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

export function Pagination({
  page,
  pageSize,
  total,
  onPage,
  onPageSize,
  disabled = false,
}: {
  page: number
  pageSize: number
  total: number
  onPage: (p: number) => void
  onPageSize: (n: number) => void
  disabled?: boolean
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  const btn =
    'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-t border-gray-100">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Rows per page</span>
        <select
          value={pageSize}
          disabled={disabled}
          onChange={(e) => onPageSize(Number(e.target.value))}
          className="border border-gray-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>
          {start}–{end} of {total}
        </span>
        <div className="flex gap-1">
          <button className={btn} disabled={disabled || page <= 1} onClick={() => onPage(page - 1)}>
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <button className={btn} disabled={disabled || page >= totalPages} onClick={() => onPage(page + 1)}>
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
