'use client'

import React, { useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import type { Category, CallType, InteractionItem, EntryProducts } from '@/app/actions/sales'

export interface EntryFormValues {
  phone: string
  name: string
  items: InteractionItem[]
  notes: string
  callType: CallType
  amount: string
  callAt: string // datetime-local value
}

interface Props {
  isOpen: boolean
  onClose: () => void
  category: Category
  title: string
  products: EntryProducts
  mode?: 'create' | 'edit'
  initial?: Partial<EntryFormValues>
  onSubmit: (values: EntryFormValues) => Promise<{ error?: string } | void>
}

// Local datetime string (YYYY-MM-DDTHH:mm) for the current moment
export function nowLocal(): string {
  const d = new Date()
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60000)
  return local.toISOString().slice(0, 16)
}

type ProductGroup = { type: InteractionItem['type']; label: string; list: { id: string; title: string }[] }

export function InteractionModal({
  isOpen,
  onClose,
  category,
  title,
  products,
  mode = 'create',
  initial,
  onSubmit,
}: Props) {
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [items, setItems] = useState<InteractionItem[]>(initial?.items ?? [])
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [callType, setCallType] = useState<CallType>(initial?.callType ?? 'inquiry')
  const [amount, setAmount] = useState(initial?.amount ?? '')
  const [callAt, setCallAt] = useState(initial?.callAt ?? nowLocal())
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const groups: ProductGroup[] = useMemo(() => {
    switch (category) {
      case 'book':
        return [{ type: 'book', label: 'Books', list: products.books }]
      case 'pdf_ppt':
        return [
          { type: 'pdf', label: 'PDFs', list: products.pdfs },
          { type: 'ppt', label: 'PPTs', list: products.ppts },
        ]
      case 'video_course':
        return [{ type: 'video_course', label: 'Online Course', list: products.videoCourses }]
      default:
        return []
    }
  }, [category, products])

  const toggleItem = (type: InteractionItem['type'], id: string, itemTitle: string) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.type === type && i.id === id)
      if (exists) return prev.filter((i) => !(i.type === type && i.id === id))
      return [...prev, { type, id, title: itemTitle }]
    })
  }

  const isSelected = (type: InteractionItem['type'], id: string) =>
    items.some((i) => i.type === type && i.id === id)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!phone.trim()) e.phone = 'Phone number is required'
    else if (!/^[0-9+\-\s]{6,15}$/.test(phone.trim())) e.phone = 'Enter a valid phone number'
    if (callType === 'purchase') {
      const amt = parseFloat(amount)
      if (!amount.trim() || isNaN(amt) || amt <= 0) e.amount = 'Enter the purchase amount'
    }
    if (!callAt) e.callAt = 'Date & time is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    const res = await onSubmit({ phone, name, items, notes, callType, amount, callAt })
    setSubmitting(false)
    if (res && 'error' in res && res.error) {
      toast.error(res.error)
      return
    }
    toast.success(mode === 'edit' ? 'Details successfully edited' : 'Call saved successfully')
    onClose()
  }

  const inputBase =
    'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 sm:text-sm text-gray-900 placeholder-gray-500'
  const okBorder = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
  const errBorder = 'border-red-300 focus:ring-red-500'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            className={`${inputBase} ${okBorder}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Leave blank if unknown"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
          <input
            className={`${inputBase} ${errors.phone ? errBorder : okBorder}`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            disabled={mode === 'edit'}
            inputMode="tel"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          {mode === 'edit' && (
            <p className="mt-1 text-xs text-gray-400">Phone number cannot be changed.</p>
          )}
        </div>

        {/* Product selection */}
        {groups.map((g) => (
          <div key={g.type}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{g.label}</label>
            {g.list.length === 0 ? (
              <p className="text-sm text-gray-400">No {g.label.toLowerCase()} available.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {g.list.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={isSelected(g.type, p.id)}
                      onChange={() => toggleItem(g.type, p.id, p.title)}
                    />
                    <span className="truncate">{p.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Call type radios */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Call type</label>
          <div className="flex gap-4">
            {(['inquiry', 'purchase'] as CallType[]).map((ct) => (
              <label key={ct} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="callType"
                  className="text-blue-600 focus:ring-blue-500"
                  checked={callType === ct}
                  onChange={() => setCallType(ct)}
                />
                <span className="capitalize">{ct}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Amount (purchase only) */}
        {callType === 'purchase' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={`${inputBase} ${errors.amount ? errBorder : okBorder}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter purchase amount"
            />
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            className={`${inputBase} ${okBorder}`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any details about the call..."
          />
        </div>

        {/* Date & time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date &amp; time</label>
          <input
            type="datetime-local"
            className={`${inputBase} ${errors.callAt ? errBorder : okBorder}`}
            value={callAt}
            onChange={(e) => setCallAt(e.target.value)}
          />
          {errors.callAt && <p className="mt-1 text-sm text-red-600">{errors.callAt}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
