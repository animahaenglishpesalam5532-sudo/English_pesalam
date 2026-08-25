'use client'

import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { AlertTriangle, RefreshCw, Send, Users, X } from 'lucide-react'
import { TemplateList } from './TemplateList'
import { TemplatePreview } from './TemplatePreview'
import { TemplateVariablesForm } from './TemplateVariables'
import { PhoneNumbersInput } from './PhoneNumbersInput'
import { CampaignSelect } from './campaigns/CampaignSelect'
import { RecipientPickerModal } from './recipients/RecipientPickerModal'
import { CARD } from './styles'
import { DEFAULT_COUNTRY_CODE, normalizePhone } from '@/lib/whatsapp/phone'
import { MAX_RECIPIENTS } from '@/lib/whatsapp/limits'
import { EMPTY_VARIABLES, type TemplateVariables, type WhatsAppTemplate } from '@/lib/whatsapp/templates'
import { getTemplates, sendTemplateMessages } from '@/app/actions/whatsapp'
import type { CampaignOption } from '@/app/actions/whatsappCampaigns'
import type { RecipientContact } from '@/app/actions/whatsappRecipients'
import type { EntryProducts } from '@/app/actions/sales'

interface Props {
  initialTemplates: WhatsAppTemplate[]
  initialError?: string
  initialCampaigns: CampaignOption[]
  products: EntryProducts
  onSent: () => void
}

export function SendTemplateCard({
  initialTemplates,
  initialError,
  initialCampaigns,
  products,
  onSent,
}: Props) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [templatesError, setTemplatesError] = useState(initialError)
  const [refreshing, setRefreshing] = useState(false)

  const [selected, setSelected] = useState<WhatsAppTemplate | null>(null)
  const [variables, setVariables] = useState<TemplateVariables>(EMPTY_VARIABLES)
  const [phones, setPhones] = useState<string[]>([])
  const [picked, setPicked] = useState<RecipientContact[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE)
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [campaignId, setCampaignId] = useState('')
  const [sending, setSending] = useState(false)
  const [failures, setFailures] = useState<{ phone: string; error: string }[]>([])

  // Manual entries and picked contacts share one cap; the server dedupes too.
  const { manualCount, recipientCount, customerIds } = useMemo(() => {
    const manual = new Set<string>()
    for (const p of phones) {
      const n = normalizePhone(p, countryCode)
      if (n) manual.add(n)
    }
    const ids: Record<string, string> = {}
    const all = new Set(manual)
    for (const c of picked) {
      const n = normalizePhone(c.phone, countryCode)
      if (!n) continue
      all.add(n)
      ids[n] = c.customerId
    }
    return { manualCount: manual.size, recipientCount: all.size, customerIds: ids }
  }, [phones, picked, countryCode])

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

  const openPicker = () => {
    if (!selected) return toast.error('Select a template first — duplicates are flagged against it')
    setPickerOpen(true)
  }

  const handleSend = async () => {
    if (!selected) return toast.error('Select a template first')
    if (!campaignId) return toast.error('Select a campaign first')
    if (!recipientCount) return toast.error('Add at least one recipient')

    setSending(true)
    setFailures([])
    const res = await sendTemplateMessages({
      templateName: selected.name,
      language: selected.language,
      variables,
      phones: [...phones, ...picked.map((c) => c.phone)],
      countryCode,
      campaignId,
      customerIds,
    })
    setSending(false)

    if (res.error) return toast.error(res.error)

    setFailures(res.failures ?? [])
    if (res.failed) toast.error(`${res.sent} sent · ${res.failed} failed`)
    else {
      toast.success(`Sent to ${res.sent} number(s)`)
      setPhones([])
      setPicked([])
    }
    onSent()
  }

  const overCap = recipientCount > MAX_RECIPIENTS

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

          <CampaignSelect
            campaigns={campaigns}
            value={campaignId}
            onChange={setCampaignId}
            onCampaignsChange={setCampaigns}
          />

          <div className="rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500">From records</p>
                <p className="text-sm text-gray-900">
                  {picked.length
                    ? `${picked.length} contact${picked.length === 1 ? '' : 's'} selected`
                    : 'No contacts picked yet'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {picked.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPicked([])}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <X className="h-3.5 w-3.5" /> Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={openPicker}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
                >
                  <Users className="h-3.5 w-3.5" />
                  {picked.length ? 'Change selection' : 'Pick from records'}
                </button>
              </div>
            </div>
          </div>

          <PhoneNumbersInput
            phones={phones}
            countryCode={countryCode}
            onChange={setPhones}
            onCountryCode={setCountryCode}
          />

          {recipientCount > 0 && (
            <div
              className={`rounded-lg border p-3 text-sm ${
                overCap ? 'border-red-200 bg-red-50 text-red-800' : 'border-blue-200 bg-blue-50 text-blue-900'
              }`}
            >
              This will send <span className="font-semibold">{recipientCount}</span> message
              {recipientCount === 1 ? '' : 's'}
              {picked.length > 0 && manualCount > 0 && (
                <span className="text-xs opacity-80">
                  {' '}
                  ({picked.length} from records + {manualCount} typed in, duplicates merged)
                </span>
              )}
              {overCap && <span className="block text-xs">Maximum is {MAX_RECIPIENTS} per send.</span>}
            </div>
          )}

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
            disabled={sending || !selected || !campaignId || !recipientCount || overCap}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {sending
              ? 'Sending...'
              : `Send to ${recipientCount} number${recipientCount === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>

      <RecipientPickerModal
        open={pickerOpen}
        products={products}
        countryCode={countryCode}
        templateName={selected?.name ?? ''}
        maxSelectable={Math.max(0, MAX_RECIPIENTS - manualCount)}
        initialSelection={picked}
        onClose={() => setPickerOpen(false)}
        onConfirm={setPicked}
      />
    </div>
  )
}
