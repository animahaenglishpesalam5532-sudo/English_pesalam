'use client'

import React from 'react'
import { Search } from 'lucide-react'
import DateField from '../../DateField'
import { productOptions } from '@/lib/sales/productOptions'
import { LABEL } from '../styles'
import type { Category, CallType, EntryProducts, RegisterFilters } from '@/app/actions/sales'

const CATEGORY_LABEL: Record<Category, string> = {
  general: 'General',
  book: 'Book',
  pdf_ppt: 'PDF & PPT',
  video_course: 'Online Class',
}

const FIELD =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'

interface Props {
  value: RegisterFilters
  products: EntryProducts
  loading: boolean
  onChange: (next: RegisterFilters) => void
  onApply: () => void
}

/** The Records filter bar, trimmed to what matters when picking recipients. */
export function RecipientFilters({ value, products, loading, onChange, onApply }: Props) {
  const quickRange = (days: number | 'all') => {
    if (days === 'all') return onChange({ ...value, from: '', to: '' })
    const from = new Date()
    from.setDate(from.getDate() - days)
    onChange({
      ...value,
      from: from.toISOString().slice(0, 10),
      to: new Date().toISOString().slice(0, 10),
    })
  }

  const todayISO = new Date().toISOString().slice(0, 10)
  const rangeIsActive = (days: number) => {
    const from = new Date()
    from.setDate(from.getDate() - days)
    return (value.from ?? '') === from.toISOString().slice(0, 10) && (value.to ?? '') === todayISO
  }

  const cats = value.category && value.category !== 'all' ? [value.category] : []
  const opts = productOptions(products, cats)
  const selectedItems = new Set(value.itemIds ?? [])

  return (
    <div className="border-b border-gray-100 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium text-gray-400">Quick range</span>
        {([
          ['30 days', 30],
          ['60 days', 60],
          ['90 days', 90],
          ['1 year', 365],
        ] as [string, number][]).map(([label, days]) => (
          <button
            key={label}
            type="button"
            onClick={() => quickRange(days)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              rangeIsActive(days) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => quickRange('all')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !value.from && !value.to ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All time
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={LABEL}>From</label>
          <DateField
            className={`${FIELD} cursor-pointer`}
            value={value.from ?? ''}
            onChange={(v) => onChange({ ...value, from: v })}
          />
        </div>
        <div>
          <label className={LABEL}>To</label>
          <DateField
            className={`${FIELD} cursor-pointer`}
            value={value.to ?? ''}
            onChange={(v) => onChange({ ...value, to: v })}
          />
        </div>
        <div>
          <label className={LABEL}>Category</label>
          <select
            className={FIELD}
            value={value.category ?? 'all'}
            onChange={(e) =>
              onChange({ ...value, category: e.target.value as Category | 'all', itemIds: [] })
            }
          >
            <option value="all">All</option>
            <option value="general">General</option>
            <option value="book">Book</option>
            <option value="pdf_ppt">PDF &amp; PPT</option>
            <option value="video_course">Online Class</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Type</label>
          <select
            className={FIELD}
            value={value.callType ?? 'all'}
            onChange={(e) => onChange({ ...value, callType: e.target.value as CallType | 'all' })}
          >
            <option value="all">Enquired or purchased</option>
            <option value="inquiry">Enquired only</option>
            <option value="purchase">Purchased</option>
          </select>
        </div>
      </div>

      {opts.length > 0 && (
        <div className="mt-3">
          <label className={LABEL}>
            {CATEGORY_LABEL[cats[0]]} items{' '}
            {selectedItems.size === 0 && <span className="text-gray-400">(all)</span>}
          </label>
          <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto rounded-lg border border-gray-200 p-2">
            {opts.map((o) => {
              const active = selectedItems.has(o.id)
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    const s = new Set(selectedItems)
                    if (s.has(o.id)) s.delete(o.id)
                    else s.add(o.id)
                    onChange({ ...value, itemIds: Array.from(s) })
                  }}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {o.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className={LABEL}>Search name / phone</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className={`${FIELD} pl-9`}
              value={value.search ?? ''}
              onChange={(e) => onChange({ ...value, search: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && onApply()}
              placeholder="Search..."
            />
          </div>
        </div>
        <label className="flex w-fit cursor-pointer items-center gap-2 pb-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={!!value.onlyLeads}
            onChange={(e) => onChange({ ...value, onlyLeads: e.target.checked })}
          />
          Only leads (never purchased)
        </label>
        <button
          type="button"
          onClick={onApply}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Apply'}
        </button>
      </div>
    </div>
  )
}
