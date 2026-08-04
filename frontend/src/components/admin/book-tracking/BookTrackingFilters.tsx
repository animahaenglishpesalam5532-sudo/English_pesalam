'use client'

import React from 'react'
import { Search } from 'lucide-react'
import { CARD, FILTER_INPUT } from './styles'

interface Props {
  search: string
  from: string
  to: string
  filtersActive: boolean
  onSearch: (v: string) => void
  onFrom: (v: string) => void
  onTo: (v: string) => void
  onClear: () => void
}

export function BookTrackingFilters({
  search,
  from,
  to,
  filtersActive,
  onSearch,
  onFrom,
  onTo,
  onClear,
}: Props) {
  return (
    <div className={`${CARD} p-4 mb-4`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className={`${FILTER_INPUT} pl-9`}
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="WhatsApp ID, name, phone or tracking no."
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input
            type="date"
            className={FILTER_INPUT}
            value={from}
            max={to || undefined}
            onChange={(e) => onFrom(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input
            type="date"
            className={FILTER_INPUT}
            value={to}
            min={from || undefined}
            onChange={(e) => onTo(e.target.value)}
          />
        </div>
      </div>
      {filtersActive && (
        <button onClick={onClear} className="mt-3 text-sm text-blue-600 hover:underline">
          Clear filters
        </button>
      )}
    </div>
  )
}
