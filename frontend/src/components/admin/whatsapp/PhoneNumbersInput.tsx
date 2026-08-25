'use client'

import React, { useState } from 'react'
import { X, XCircle } from 'lucide-react'
import { formatPhone, normalizePhone, splitPhoneInput } from '@/lib/whatsapp/phone'
import { LABEL } from './styles'

interface Props {
  phones: string[]
  countryCode: string
  /** E.164 numbers an earlier send failed for — flagged as the admin types. */
  failedPhones: Set<string>
  onChange: (phones: string[]) => void
  onCountryCode: (code: string) => void
}

/**
 * Tag-style entry for many recipients: type a number and press Enter (or
 * comma / space), or paste a whole list at once.
 */
export function PhoneNumbersInput({
  phones,
  countryCode,
  failedPhones,
  onChange,
  onCountryCode,
}: Props) {
  const [draft, setDraft] = useState('')

  const commit = (raw: string) => {
    const entries = splitPhoneInput(raw)
    if (!entries.length) return
    const next = [...phones]
    for (const entry of entries) {
      if (!next.includes(entry)) next.push(entry)
    }
    onChange(next)
    setDraft('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';' || e.key === ' ' || e.key === 'Tab') {
      if (!draft.trim()) return
      e.preventDefault()
      commit(draft)
    } else if (e.key === 'Backspace' && !draft && phones.length) {
      onChange(phones.slice(0, -1))
    }
  }

  const invalidCount = phones.filter((p) => !normalizePhone(p, countryCode)).length
  const failedCount = phones.filter((p) => {
    const n = normalizePhone(p, countryCode)
    return !!n && failedPhones.has(n)
  }).length

  return (
    <div>
      <div className="flex items-end justify-between gap-3 mb-1">
        <label className={`${LABEL} mb-0`}>Recipients</label>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">Default code</span>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-gray-400">+</span>
            <input
              value={countryCode}
              onChange={(e) => onCountryCode(e.target.value.replace(/\D/g, ''))}
              className="w-16 pl-5 pr-2 py-1 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 rounded-lg border border-gray-300 p-2 focus-within:ring-2 focus-within:ring-blue-500">
        {phones.map((phone, i) => {
          const normalized = normalizePhone(phone, countryCode)
          const failed = !!normalized && failedPhones.has(normalized)
          return (
            <span
              key={`${phone}-${i}`}
              title={
                !normalized
                  ? 'Invalid number — include the country code'
                  : failed
                    ? 'An earlier message to this number failed. Sending again usually fails too.'
                    : undefined
              }
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${
                !normalized
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : failed
                    ? 'border-orange-200 bg-orange-50 text-orange-700'
                    : 'border-blue-200 bg-blue-50 text-blue-800'
              }`}
            >
              {failed && <XCircle className="h-3 w-3" />}
              {normalized ? formatPhone(normalized) : phone}
              <button
                type="button"
                onClick={() => onChange(phones.filter((_, index) => index !== i))}
                className="opacity-60 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )
        })}

        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => commit(draft)}
          onPaste={(e) => {
            const text = e.clipboardData.getData('text')
            if (/[\s,;]/.test(text)) {
              e.preventDefault()
              commit(text)
            }
          }}
          placeholder={phones.length ? '' : '+91 9345639627, 9876543210 ...'}
          className="min-w-[180px] flex-1 border-0 px-1 py-1 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
        />
      </div>

      {failedCount > 0 && (
        <p className="mt-1.5 text-xs text-orange-700">
          {failedCount} of these numbers {failedCount === 1 ? 'has' : 'have'} been messaged before
          and the send failed — usually Meta&apos;s per-recipient marketing cap. Sending again tends
          to fail too and hurts your number&apos;s quality rating.
        </p>
      )}

      <div className="mt-1.5 flex items-center justify-between text-xs">
        <span className={invalidCount ? 'text-red-600' : 'text-gray-400'}>
          {phones.length} number{phones.length === 1 ? '' : 's'}
          {invalidCount > 0 && ` · ${invalidCount} invalid`}
        </span>
        {phones.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="font-medium text-blue-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}
