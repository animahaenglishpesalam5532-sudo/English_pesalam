'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import { BookPicker } from './BookPicker'
import { fieldClass } from './styles'
import { COURIER_OPTIONS } from '@/lib/bookTracking/constants'
import type { BookOption, TrackedBook } from '@/app/actions/bookTracking'
import type { ImportRow } from '@/lib/bookTracking/importParser'
import {
  DEFAULT_PHONE_COUNTRY,
  toInputPhone,
  toStoredPhone,
  validatePhone,
  type PhoneCountry,
} from '@/lib/bookTracking/phone'

interface Props {
  row: ImportRow
  rowIndex: number
  books: BookOption[]
  onSave: (index: number, updated: ImportRow) => void
  onClose: () => void
}

export function BookTrackingImportEditModal({
  row,
  rowIndex,
  books,
  onSave,
  onClose,
}: Props) {
  const [date, setDate] = useState(row.date || new Date().toISOString().slice(0, 10))
  const [whatsappId, setWhatsappId] = useState(row.whatsappId)
  const [name, setName] = useState(row.name)
  const [phone, setPhone] = useState(() => toInputPhone(row.phone))
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>(DEFAULT_PHONE_COUNTRY)
  const [courier, setCourier] = useState(row.courier)
  const [trackingNo, setTrackingNo] = useState(row.trackingNo)
  const [items, setItems] = useState<TrackedBook[]>(row.items)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!date?.trim()) e.date = 'Date is required'
    if (!whatsappId?.trim()) e.whatsappId = 'WhatsApp ID is required'
    if (!name?.trim()) e.name = 'Name is required'
    const phoneError = validatePhone(phone, phoneCountry)
    if (phoneError) e.phone = phoneError
    if (!trackingNo?.trim()) e.trackingNo = 'Tracking number is required'
    if (!items.length) e.items = 'Select at least one book'
    else if (items.some((i) => !Number.isInteger(i.qty) || i.qty < 1)) {
      e.qty = 'Minimum quantity should be 1'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    onSave(rowIndex, {
      ...row,
      date,
      whatsappId: whatsappId.trim(),
      name: name.trim(),
      phone: toStoredPhone(phone, phoneCountry),
      courier,
      trackingNo: trackingNo.trim(),
      items,
      // Clear errors after a successful manual edit
      errors: [],
      warnings: [],
    })
    onClose()
  }

  return (
    /* Higher z-index so it renders on top of the import modal */
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Edit Import Row</h3>
            <p className="text-xs text-gray-500 mt-0.5">Row {rowIndex + 1}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              className={`${fieldClass(!!errors.date)} cursor-pointer`}
              value={date}
              onClick={(e) => {
                try {
                  e.currentTarget.showPicker?.()
                } catch {}
              }}
              onChange={(e) => setDate(e.target.value)}
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>

          {/* WhatsApp ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp ID</label>
            <input
              className={fieldClass(!!errors.whatsappId)}
              value={whatsappId}
              onChange={(e) => setWhatsappId(e.target.value)}
              placeholder="Order reference"
            />
            {errors.whatsappId && <p className="mt-1 text-sm text-red-600">{errors.whatsappId}</p>}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              className={fieldClass(!!errors.name)}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Customer name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
            <PhoneInput
              defaultCountry="in"
              value={phone}
              onChange={(value, meta) => {
                setPhone(value)
                setPhoneCountry(meta.country)
              }}
              className="phone-field w-full"
              inputClassName={`!w-full !text-sm !py-2 ${errors.phone ? '!border-red-300' : ''}`}
              countrySelectorStyleProps={{ buttonClassName: errors.phone ? '!border-red-300' : '' }}
              placeholder="e.g. 9876543210"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          {/* Courier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Courier Name{' '}
              <span className="text-gray-400 text-xs font-normal">(Optional)</span>
            </label>
            <select
              className={fieldClass(false)}
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
            >
              <option value="">Select courier (optional)</option>
              {COURIER_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Tracking No */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tracking number
            </label>
            <input
              className={fieldClass(!!errors.trackingNo)}
              value={trackingNo}
              onChange={(e) => setTrackingNo(e.target.value)}
              placeholder="Courier tracking number"
            />
            {errors.trackingNo && (
              <p className="mt-1 text-sm text-red-600">{errors.trackingNo}</p>
            )}
          </div>

          {/* Books */}
          <BookPicker
            books={books}
            value={items}
            onChange={setItems}
            selectionError={errors.items}
            qtyError={errors.qty}
          />
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
