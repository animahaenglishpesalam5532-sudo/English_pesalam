'use client'

import React from 'react'
import { Search } from 'lucide-react'
import { CARD, FILTER_INPUT, LABEL } from './styles'

interface Props {
  search: string
  status: '' | 'sent' | 'failed'
  from: string
  to: string
  filtersActive: boolean
  onSearch: (v: string) => void
  onStatus: (v: '' | 'sent' | 'failed') => void
  onFrom: (v: string) => void
  onTo: (v: string) => void
  onClear: () => void
}

export function MessageLogFilters({
  search,
  status,
  from,
  to,
  filtersActive,
  onSearch,
  onStatus,
  onFrom,
  onTo,
  onClear,
}: Props) {
  return (
    <div className={`${CARD} p-4 mb-4`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className={LABEL}>Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className={`${FILTER_INPUT} pl-9`}
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Phone or template..."
            />
          </div>
        </div>

        <div>
          <label className={LABEL}>Status</label>
          <select
            className={FILTER_INPUT}
            value={status}
            onChange={(e) => onStatus(e.target.value as '' | 'sent' | 'failed')}
          >
            <option value="">All</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div>
          <label className={LABEL}>From</label>
          <input
            type="date"
            className={`${FILTER_INPUT} cursor-pointer`}
            value={from}
            max={to || undefined}
            onClick={(e) => {
              try {
                e.currentTarget.showPicker?.()
              } catch {}
            }}
            onChange={(e) => onFrom(e.target.value)}
          />
        </div>

        <div>
          <label className={LABEL}>To</label>
          <input
            type="date"
            className={`${FILTER_INPUT} cursor-pointer`}
            value={to}
            min={from || undefined}
            onClick={(e) => {
              try {
                e.currentTarget.showPicker?.()
              } catch {}
            }}
            onChange={(e) => onTo(e.target.value)}
          />
        </div>
      </div>

      {filtersActive && (
        <div className="mt-3">
          <button
            onClick={onClear}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
