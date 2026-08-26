'use client'

import React, { useEffect, useState } from 'react'
import { X, Loader2, Send } from 'lucide-react'
import { TemplateVariablesForm } from '../TemplateVariables'
import { TemplatePreview } from '../TemplatePreview'
import { getInboxTemplates } from '@/app/actions/whatsappInbox'
import {
  missingVariables,
  EMPTY_VARIABLES,
  type TemplateVariables,
  type WhatsAppTemplate,
} from '@/lib/whatsapp/templates'
import { LABEL } from '../styles'

interface Props {
  open: boolean
  sending: boolean
  onClose: () => void
  onSend: (template: WhatsAppTemplate, variables: TemplateVariables) => void | Promise<void>
}

export function TemplateSendModal({ open, sending, onClose, onSend }: Props) {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedKey, setSelectedKey] = useState('')
  const [variables, setVariables] = useState<TemplateVariables>(EMPTY_VARIABLES)

  // Fetched only when the modal opens: the Graph API call is slow and most
  // conversations are answered with free text, not a template.
  useEffect(() => {
    if (!open || templates.length) return
    setLoading(true)
    getInboxTemplates().then((res) => {
      setLoading(false)
      setTemplates(res.templates)
      setError(res.error ?? '')
    })
  }, [open, templates.length])

  if (!open) return null

  const selected = templates.find((t) => `${t.name}|${t.language}` === selectedKey) ?? null
  const missing = selected ? missingVariables(selected, variables) : []

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-xl bg-white sm:max-w-lg sm:rounded-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Send a template</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

          {!loading && (
            <div>
              <label className={LABEL}>Template</label>
              <select
                value={selectedKey}
                onChange={(e) => {
                  setSelectedKey(e.target.value)
                  setVariables(EMPTY_VARIABLES)
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Choose an approved template…</option>
                {templates.map((t) => (
                  <option key={`${t.name}|${t.language}`} value={`${t.name}|${t.language}`}>
                    {t.name} ({t.language})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selected && (
            <>
              <TemplateVariablesForm
                template={selected}
                variables={variables}
                onChange={setVariables}
              />
              <div>
                <p className={LABEL}>Preview</p>
                <TemplatePreview template={selected} variables={variables} />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selected || sending || missing.length > 0}
            onClick={() => selected && onSend(selected, variables)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {missing.length ? `Fill in: ${missing.join(', ')}` : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
