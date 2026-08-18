'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { AlertTriangle, RefreshCw, Send } from 'lucide-react'
import { TemplateList } from './TemplateList'
import { TemplatePreview } from './TemplatePreview'
import { TemplateVariablesForm } from './TemplateVariables'
import { PhoneNumbersInput } from './PhoneNumbersInput'
import { CARD } from './styles'
import { DEFAULT_COUNTRY_CODE } from '@/lib/whatsapp/phone'
import { EMPTY_VARIABLES, type TemplateVariables, type WhatsAppTemplate } from '@/lib/whatsapp/templates'
import { getTemplates, sendTemplateMessages } from '@/app/actions/whatsapp'

interface Props {
  initialTemplates: WhatsAppTemplate[]
  initialError?: string
  onSent: () => void
}

export function SendTemplateCard({ initialTemplates, initialError, onSent }: Props) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [templatesError, setTemplatesError] = useState(initialError)
  const [refreshing, setRefreshing] = useState(false)

  const [selected, setSelected] = useState<WhatsAppTemplate | null>(null)
  const [variables, setVariables] = useState<TemplateVariables>(EMPTY_VARIABLES)
  const [phones, setPhones] = useState<string[]>([])
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE)
  const [sending, setSending] = useState(false)
  const [failures, setFailures] = useState<{ phone: string; error: string }[]>([])

  const selectTemplate = (template: WhatsAppTemplate) => {
    setSelected(template)
    setVariables(EMPTY_VARIABLES)
  }

  const refresh = async () => {
    setRefreshing(true)
    const res = await getTemplates()
    setRefreshing(false)
    setTemplates(res.templates)
    setTemplatesError(res.error)
    if (res.error) toast.error(res.error)
    else toast.success(`${res.templates.length} template(s) loaded`)
  }

  const handleSend = async () => {
    if (!selected) return toast.error('Select a template first')
    if (!phones.length) return toast.error('Add at least one phone number')

    setSending(true)
    setFailures([])
    const res = await sendTemplateMessages({
      templateName: selected.name,
      language: selected.language,
      variables,
      phones,
      countryCode,
    })
    setSending(false)

    if (res.error) return toast.error(res.error)

    setFailures(res.failures ?? [])
    if (res.failed) toast.error(`${res.sent} sent · ${res.failed} failed`)
    else {
      toast.success(`Sent to ${res.sent} number(s)`)
      setPhones([])
    }
    onSent()
  }

  return (
    <div className={`${CARD} p-4 mb-6`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-900">
              Templates
              <span className="ml-1.5 font-normal text-gray-400">({templates?.length ?? 0})</span>
            </h2>
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {templatesError && (
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{templatesError}</span>
            </div>
          )}

          <TemplateList templates={templates} selected={selected} onSelect={selectTemplate} />
        </div>

        <div className="space-y-4">
          {selected ? (
            <>
              <TemplatePreview template={selected} variables={variables} />
              <TemplateVariablesForm
                template={selected}
                variables={variables}
                onChange={setVariables}
              />
            </>
          ) : (
            <p className="rounded-lg border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
              Select a template to preview it.
            </p>
          )}

          <PhoneNumbersInput
            phones={phones}
            countryCode={countryCode}
            onChange={setPhones}
            onCountryCode={setCountryCode}
          />

          {failures.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-semibold text-red-800">Failed sends</p>
              <ul className="mt-1 space-y-0.5 text-xs text-red-700">
                {failures.map((f) => (
                  <li key={f.phone}>
                    +{f.phone} — {f.error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !selected || !phones.length}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : `Send to ${phones.length} number${phones.length === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </div>
  )
}
