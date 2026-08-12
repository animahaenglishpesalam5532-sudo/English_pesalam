'use client'

import React, { useState } from 'react'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import toast from 'react-hot-toast'
import { Modal } from '@/components/ui/Modal'
import {
  DEFAULT_PHONE_COUNTRY,
  toInputPhone,
  toStoredPhone,
  validatePhone,
  type PhoneCountry,
} from '@/lib/bookTracking/phone'
import { BookPicker } from './BookPicker'
import { fieldClass } from './styles'
import { COURIER_OPTIONS } from '@/lib/bookTracking/constants'
import {
  type BookOption,
  type BookTrackingInput,
  type TrackedBook,
} from '@/app/actions/bookTracking'

export interface BookTrackingModalInitial extends Partial<BookTrackingInput> {}

function toLocalDateString(iso?: string): string {
  const d = iso ? new Date(iso) : new Date()
  if (isNaN(d.getTime())) {
    const fallback = new Date()
    const local = new Date(fallback.getTime() - fallback.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 10)
  }
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

interface Props {
  isOpen: boolean
  onClose: () => void
  books: BookOption[]
  mode: 'create' | 'edit'
  initial?: BookTrackingModalInitial
  onSubmit: (values: BookTrackingInput) => Promise<{ error?: string } | void>
}

export function BookTrackingModal({
  isOpen,
  onClose,
  books,
  mode,
  initial,
  onSubmit,
}: Props) {
  const [date, setDate] = useState(() => toLocalDateString(initial?.createdAt))
  const [whatsappId, setWhatsappId] = useState(initial?.whatsappId ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [phone, setPhone] = useState(toInputPhone(initial?.phone))
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>(DEFAULT_PHONE_COUNTRY)
  const [courierName, setCourierName] = useState(initial?.courierName ?? '')
  const [trackingNumber, setTrackingNumber] = useState(initial?.trackingNumber ?? '')
  const [items, setItems] = useState<TrackedBook[]>(initial?.items ?? [])
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!date?.trim()) e.date = 'Date is required'
    if (!whatsappId?.trim()) e.whatsappId = 'WhatsApp ID is required'
    if (!name?.trim()) e.name = 'Name is required'

    const phoneError = validatePhone(phone, phoneCountry)
    if (phoneError) e.phone = phoneError

    if (!trackingNumber?.trim()) e.trackingNumber = 'Tracking number is required'
    if (!items?.length) e.items = 'Select at least one book'
    else if (items.some((i) => !Number.isInteger(i.qty) || i.qty < 1)) {
      e.qty = 'Minimum quantity should be 1'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    const res = await onSubmit({
      whatsappId: whatsappId?.trim(),
      name: name?.trim(),
      phone: toStoredPhone(phone, phoneCountry),
      courierName: courierName?.trim() || null,
      trackingNumber: trackingNumber?.trim(),
      items,
      createdAt: date,
    })
    setSubmitting(false)
    if (res && 'error' in res && res.error) {
      toast.error(res.error)
      return
    }
    toast.success(mode === 'edit' ? 'Record updated' : 'Record saved successfully')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit Delivery Record' : 'New Delivery Record'}
      closeOnBackdropClick={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp ID</label>
          <input
            className={fieldClass(!!errors.whatsappId)}
            value={whatsappId}
            onChange={(e) => setWhatsappId(e.target.value)}
            placeholder="e.g. order reference from the chat"
          />
          {errors.whatsappId && <p className="mt-1 text-sm text-red-600">{errors.whatsappId}</p>}
        </div>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Courier Name <span className="text-gray-400 text-xs font-normal">(Optional)</span>
          </label>
          <select
            className={fieldClass(false)}
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
          >
            <option value="">Select courier (optional)</option>
            {COURIER_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tracking number</label>
          <input
            className={fieldClass(!!errors.trackingNumber)}
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Courier tracking number"
          />
          {errors.trackingNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.trackingNumber}</p>
          )}
        </div>

        <BookPicker
          books={books}
          value={items}
          onChange={setItems}
          selectionError={errors.items}
          qtyError={errors.qty}
        />

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
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
