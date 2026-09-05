'use client'

import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { AlertTriangle, X } from 'lucide-react'
import { RecipientFilters } from './RecipientFilters'
import { RecipientTable, type RecipientRow } from './RecipientTable'
import { normalizePhone } from '@/lib/whatsapp/phone'
import { getRecipientContacts, type RecipientContact } from '@/app/actions/whatsappRecipients'
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
  /** Numbers that already received this template — the duplicate flag. */
  sentPhones: Set<string>
  /** Numbers an earlier send failed for — left unticked by default. */
  failedPhones: Set<string>
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
  sentPhones,
  failedPhones,
  maxSelectable,
  initialSelection,
  onClose,
  onConfirm,
}: Props) {
  const [filters, setFilters] = useState<RegisterFilters>(DEFAULT_FILTERS)
  const [contacts, setContacts] = useState<RecipientContact[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [truncated, setTruncated] = useState(false)
  const [hideAlreadySent, setHideAlreadySent] = useState(true)
  const [quickSelectCount, setQuickSelectCount] = useState(0)

  // Seed from the previous pick each time the popup opens.
  useEffect(() => {
    if (!open) return
    setFilters(DEFAULT_FILTERS)
    setContacts(initialSelection)
    setSelected(new Set(initialSelection.map((c) => c.customerId)))
    setTruncated(false)
    setHideAlreadySent(true)
    setQuickSelectCount(0)
  }, [open, initialSelection])

  const rows: RecipientRow[] = useMemo(
    () =>
      contacts.map((contact) => {
        const phone = normalizePhone(contact.phone, countryCode)
        return {
          contact,
          phone,
          alreadySent: !!phone && sentPhones.has(phone),
          previouslyFailed: !!phone && failedPhones.has(phone),
        }
      }),
    [contacts, countryCode, sentPhones, failedPhones]
  )

  /** Rows visible in the table — excludes already-sent & failed when the toggle is on. */
  const visibleRows = useMemo(
    () => (hideAlreadySent ? rows.filter((r) => !r.alreadySent && !r.previouslyFailed) : rows),
    [rows, hideAlreadySent]
  )

  const hiddenInList = rows.filter((r) => r.alreadySent || r.previouslyFailed).length

  const apply = async () => {
    setLoading(true)
    const res = await getRecipientContacts(filters)
    setLoading(false)
    setContacts(res.contacts)
    setTruncated(res.truncated)

    // Don't auto-select — leave the selection empty so the admin manually
    // picks who they want to message.
    setSelected(new Set())

    if (!res.contacts.length) toast('No contacts matched those filters')
  }

  /** Select the first N contacts from the visible list, up to the cap. */
  const selectTopN = () => {
    const n = Math.min(quickSelectCount, maxSelectable)
    if (n <= 0) return
    const next = new Set<string>()
    for (const row of visibleRows) {
      if (next.size >= n) break
      if (row.phone) next.add(row.contact.customerId)
    }
    setSelected(next)
    setQuickSelectCount(0)
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
  const failedSelected = rows.filter(
    (r) => r.previouslyFailed && selected.has(r.contact.customerId)
  ).length
  const failedInList = rows.filter((r) => r.previouslyFailed).length

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

        {failedInList > 0 && (
          <div className="flex items-start gap-2 border-b border-orange-100 bg-orange-50 px-5 py-2 text-xs text-orange-700">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              {failedInList} contact{failedInList === 1 ? ' has' : 's have'} been messaged before and
              the send failed — usually Meta&apos;s per-recipient marketing cap. They are left
              unticked because sending again tends to fail too and hurts your number&apos;s quality
              rating. Tick them only if you know something has changed.
            </span>
          </div>
        )}

        {/* Toolbar above the table — toggle + quick-select + clear */}
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 bg-gray-50 px-5 py-2">

          {/* Hide already sent / failed toggle */}
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <div
              role="checkbox"
              aria-checked={hideAlreadySent}
              tabIndex={0}
              onClick={() => setHideAlreadySent((v) => !v)}
              onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setHideAlreadySent((v) => !v)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                hideAlreadySent ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  hideAlreadySent ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-xs text-gray-700">
              Hide already sent / failed
              {hiddenInList > 0 && (
                <span className="ml-1.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700">
                  {hiddenInList}
                </span>
              )}
            </span>
          </label>

          {/* Divider */}
          <span className="h-4 w-px bg-gray-300" />

          {/* Quick-select first N contacts */}
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              max={maxSelectable}
              value={quickSelectCount === 0 ? '' : quickSelectCount}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                setQuickSelectCount(isNaN(v) || v < 0 ? 0 : v)
              }}
              onKeyDown={(e) => e.key === 'Enter' && selectTopN()}
              placeholder="0"
              className="w-16 rounded-md border border-gray-300 px-2 py-1 text-center text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={selectTopN}
              disabled={quickSelectCount <= 0 || visibleRows.length === 0}
              className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Select
            </button>
          </div>

          {/* Spacer pushes clear-selection to the right */}
          <span className="flex-1" />

          {/* Clear selection — only shown when something is selected */}
          {selected.size > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600">
                <span className="font-semibold text-gray-900">{selected.size}</span> selected
                {alreadySentSelected > 0 && (
                  <span className="ml-2 text-red-600">{alreadySentSelected} already sent</span>
                )}
                {failedSelected > 0 && (
                  <span className="ml-2 text-orange-700">{failedSelected} failed</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          <RecipientTable
            rows={visibleRows}
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
            <span className="text-gray-400">· max {maxSelectable}</span>
            {alreadySentSelected > 0 && (
              <span className="ml-2 text-red-600">
                {alreadySentSelected} already received this template
              </span>
            )}
            {failedSelected > 0 && (
              <span className="ml-2 text-orange-700">{failedSelected} failed previously</span>
            )}
          </div>
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
  )
}
