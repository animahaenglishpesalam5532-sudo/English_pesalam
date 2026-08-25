'use client'

import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { AlertTriangle, X } from 'lucide-react'
import { RecipientFilters } from './RecipientFilters'
import { RecipientTable, type RecipientRow } from './RecipientTable'
import { normalizePhone } from '@/lib/whatsapp/phone'
import {
  getRecipientContacts,
  getSentPhonesForTemplate,
  type RecipientContact,
} from '@/app/actions/whatsappRecipients'
import type { EntryProducts, RegisterFilters } from '@/app/actions/sales'

const DEFAULT_FILTERS: RegisterFilters = {
  from: '',
  to: '',
  category: 'all',
  callType: 'all',
  itemIds: [],
  search: '',
  sort: 'recent',
}

interface Props {
  open: boolean
  products: EntryProducts
  countryCode: string
  /** Template being sent — drives the "already sent" flag. */
  templateName: string
  /** How many more recipients fit before the per-send cap. */
  maxSelectable: number
  /** Previously picked contacts, so reopening shows what is already chosen. */
  initialSelection: RecipientContact[]
  onClose: () => void
  onConfirm: (contacts: RecipientContact[]) => void
}

export function RecipientPickerModal({
  open,
  products,
  countryCode,
  templateName,
  maxSelectable,
  initialSelection,
  onClose,
  onConfirm,
}: Props) {
  const [filters, setFilters] = useState<RegisterFilters>(DEFAULT_FILTERS)
  const [contacts, setContacts] = useState<RecipientContact[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sentPhones, setSentPhones] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [truncated, setTruncated] = useState(false)

  // Seed from the previous pick each time the popup opens.
  useEffect(() => {
    if (!open) return
    setFilters(DEFAULT_FILTERS)
    setContacts(initialSelection)
    setSelected(new Set(initialSelection.map((c) => c.customerId)))
    setTruncated(false)
  }, [open, initialSelection])

  // Duplicate check is all-time and campaign-agnostic: has this number ever
  // successfully received this template?
  useEffect(() => {
    if (!open || !templateName) {
      setSentPhones(new Set())
      return
    }
    let active = true
    getSentPhonesForTemplate(templateName).then((phones) => {
      if (active) setSentPhones(new Set(phones))
    })
    return () => {
      active = false
    }
  }, [open, templateName])

  const rows: RecipientRow[] = useMemo(
    () =>
      contacts.map((contact) => {
        const phone = normalizePhone(contact.phone, countryCode)
        return { contact, phone, alreadySent: !!phone && sentPhones.has(phone) }
      }),
    [contacts, countryCode, sentPhones]
  )

  const apply = async () => {
    setLoading(true)
    const res = await getRecipientContacts(filters)
    setLoading(false)
    setContacts(res.contacts)
    setTruncated(res.truncated)

    // Pre-tick the first `maxSelectable` reachable contacts; the admin unticks
    // whoever they don't want (duplicates are flagged in red).
    const next = new Set<string>()
    for (const c of res.contacts) {
      if (next.size >= maxSelectable) break
      if (normalizePhone(c.phone, countryCode)) next.add(c.customerId)
    }
    setSelected(next)

    if (!res.contacts.length) toast('No contacts matched those filters')
  }

  const toggle = (customerId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(customerId)) next.delete(customerId)
      else if (next.size < maxSelectable) next.add(customerId)
      else toast.error(`You can select at most ${maxSelectable} contacts`)
      return next
    })
  }

  const selectedContacts = useMemo(
    () => contacts.filter((c) => selected.has(c.customerId)),
    [contacts, selected]
  )
  const alreadySentSelected = rows.filter((r) => r.alreadySent && selected.has(r.contact.customerId)).length

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pick recipients from records</h3>
            <p className="text-xs text-gray-500">
              Filter the sales register, then tick who should get this template.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <RecipientFilters
          value={filters}
          products={products}
          loading={loading}
          onChange={setFilters}
          onApply={apply}
        />

        {truncated && (
          <div className="flex items-start gap-2 border-b border-amber-100 bg-amber-50 px-5 py-2 text-xs text-amber-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Only the 5000 most recent records were scanned. Narrow the date range for a complete
              list.
            </span>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <RecipientTable
            rows={rows}
            selected={selected}
            loading={loading}
            capReached={selected.size >= maxSelectable}
            onToggle={toggle}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{selected.size}</span> of {contacts.length}{' '}
            selected
            <span className="text-gray-400"> · max {maxSelectable}</span>
            {alreadySentSelected > 0 && (
              <span className="ml-2 text-red-600">
                {alreadySentSelected} already received this template
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear selection
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm(selectedContacts)
                onClose()
              }}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Use {selected.size} contact{selected.size === 1 ? '' : 's'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
