'use client'

import React from 'react'
import { AlertCircle, XCircle } from 'lucide-react'
import { formatPhone } from '@/lib/whatsapp/phone'
import type { Category } from '@/app/actions/sales'
import type { RecipientContact } from '@/app/actions/whatsappRecipients'

const CATEGORY_LABEL: Record<Category, string> = {
  general: 'General',
  book: 'Book',
  pdf_ppt: 'PDF & PPT',
  video_course: 'Online Class',
}

export interface RecipientRow {
  contact: RecipientContact
  /** E.164 digits, or null when the stored number cannot be dialled. */
  phone: string | null
  alreadySent: boolean
  /** A previous send to this number failed and nothing has reached it since. */
  previouslyFailed: boolean
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface Props {
  rows: RecipientRow[]
  selected: Set<string>
  loading: boolean
  /** True once the 250 cap is hit — unselected rows can no longer be ticked. */
  capReached: boolean
  onToggle: (customerId: string) => void
}

export function RecipientTable({ rows, selected, loading, capReached, onToggle }: Props) {
  if (loading) {
    return <p className="py-16 text-center text-sm text-gray-500">Loading contacts…</p>
  }
  if (!rows.length) {
    return (
      <p className="py-16 text-center text-sm text-gray-500">
        No contacts for these filters. Adjust the filters and hit Apply.
      </p>
    )
  }

  return (
    <table className="min-w-full divide-y divide-gray-100">
      <thead className="sticky top-0 z-10 bg-gray-50">
        <tr>
          {['', 'Name', 'Phone', 'Enquired / bought', 'Records', 'Last activity'].map((h, i) => (
            <th
              key={i}
              className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.map(({ contact, phone, alreadySent, previouslyFailed }) => {
          const isSelected = selected.has(contact.customerId)
          const unreachable = !phone
          const blocked = unreachable || (capReached && !isSelected)
          const tint = alreadySent
            ? 'bg-red-50 hover:bg-red-100'
            : previouslyFailed
              ? 'bg-orange-50 hover:bg-orange-100'
              : 'hover:bg-gray-50'
          return (
            <tr
              key={contact.customerId}
              onClick={() => !blocked && onToggle(contact.customerId)}
              className={`${blocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${tint}`}
            >
              <td className="px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={blocked}
                  onChange={() => onToggle(contact.customerId)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-3 py-2.5 text-sm font-medium text-gray-900">
                {contact.name || '—'}
                {alreadySent && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                    <AlertCircle className="h-3 w-3" /> Already sent
                  </span>
                )}
                {previouslyFailed && (
                  <span
                    title="An earlier message to this number failed. Sending again usually fails too."
                    className="ml-2 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700"
                  >
                    <XCircle className="h-3 w-3" /> Failed before
                  </span>
                )}
              </td>
              <td className={`px-3 py-2.5 text-sm ${unreachable ? 'text-red-600' : 'text-gray-600'}`}>
                {phone ? formatPhone(phone) : `${contact.phone} (invalid)`}
              </td>
              <td className="px-3 py-2.5 text-xs text-gray-600">
                {contact.categories.map((c) => CATEGORY_LABEL[c]).join(', ')}
                <span className="ml-1 text-gray-400">
                  ({contact.callTypes.join(' + ')})
                </span>
              </td>
              <td className="px-3 py-2.5 text-sm text-gray-600">{contact.records}</td>
              <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-500">
                {fmtDate(contact.lastAt)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
