'use client'

import React from 'react'
import type { BookOption, TrackedBook } from '@/app/actions/bookTracking'

interface Props {
  books: BookOption[]
  value: TrackedBook[]
  onChange: (items: TrackedBook[]) => void
  /** Set when no book is selected. */
  selectionError?: string
  /** Set when a selected book has a blank or < 1 quantity. */
  qtyError?: string
}

/** Multi-select list of books, each selected row gaining its own quantity box. */
export function BookPicker({ books, value, onChange, selectionError, qtyError }: Props) {
  const toggle = (b: BookOption) => {
    onChange(
      value?.some((i) => i.id === b.id)
        ? value.filter((i) => i.id !== b.id)
        : [...value, { id: b.id, title: b.title, qty: 1 }]
    )
  }

  // `undefined` while the field is being cleared; validated on save so the user
  // can freely backspace.
  const setQty = (id: string, qty: number | undefined) => {
    onChange(value?.map((i) => (i.id === id ? { ...i, qty: qty as number } : i)))
  }

  const qtyOf = (id: string): number | '' => {
    const found = value?.find((i) => i.id === id)
    return Number.isFinite(found?.qty) ? (found?.qty as number) : ''
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Books</label>
      {books?.length === 0 ? (
        <p className="text-sm text-gray-400">No books available.</p>
      ) : (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-2 ${
            selectionError ? 'border-red-300' : 'border-gray-200'
          }`}
        >
          {books?.map((b) => {
            const selected = value?.some((i) => i.id === b.id)
            const q = qtyOf(b.id)
            const invalid = !!qtyError && selected && (q === '' || Number(q) < 1)
            return (
              <div key={b.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50">
                <label className="flex flex-1 min-w-0 items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selected}
                    onChange={() => toggle(b)}
                  />
                  <span className="truncate">{b.title}</span>
                </label>
                {selected && (
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-xs text-gray-500">Qty</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={q}
                      onChange={(e) => {
                        const v = e.target.value
                        setQty(b.id, v === '' ? undefined : parseInt(v, 10))
                      }}
                      className={`w-14 px-2 py-1 border rounded text-sm text-gray-900 focus:outline-none focus:ring-2 ${
                        invalid
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      {selectionError && <p className="mt-1 text-sm text-red-600">{selectionError}</p>}
      {qtyError && <p className="mt-1 text-sm text-red-600">{qtyError}</p>}
    </div>
  )
}
