'use client'

import React from 'react'
import { Search } from 'lucide-react'
import { COURIER_OPTIONS } from '@/lib/bookTracking/constants'
import { CARD, FILTER_INPUT } from './styles'

interface Props {
  search: string
  whatsappId: string
  courierName: string
  from: string
  to: string
  filtersActive: boolean
  onSearch: (v: string) => void
  onWhatsappId: (v: string) => void
  onCourierName: (v: string) => void
  onFrom: (v: string) => void
  onTo: (v: string) => void
  onClear: () => void
}

export function BookTrackingFilters({
  search,
  whatsappId,
  courierName,
  from,
  to,
  filtersActive,
  onSearch,
  onWhatsappId,
  onCourierName,
  onFrom,
  onTo,
  onClear,
}: Props) {
  return (
    <div className={`${CARD} p-4 mb-4`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className={`${FILTER_INPUT} pl-9`}
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Name, phone, tracking no..."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">WhatsApp ID</label>
          <input
            className={FILTER_INPUT}
            value={whatsappId}
            onChange={(e) => onWhatsappId(e.target.value)}
            placeholder="Filter WhatsApp ID..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Courier</label>
          <select
            className={FILTER_INPUT}
            value={courierName}
            onChange={(e) => onCourierName(e.target.value)}
          >
            <option value="">All Couriers</option>
            {COURIER_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
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
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
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
        <div className="mt-3 flex items-center justify-between">
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
