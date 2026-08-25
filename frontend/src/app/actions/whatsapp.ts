'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/roles'
import { sendTemplate } from '@/lib/whatsapp/client'
import { normalizePhone, DEFAULT_COUNTRY_CODE } from '@/lib/whatsapp/phone'
import { MAX_RECIPIENTS } from '@/lib/whatsapp/limits'
import type { MessageStatus } from '@/lib/whatsapp/status'
import { fetchTemplates } from '@/lib/whatsapp/templatesApi'
import {
  buildTemplateComponents,
  missingVariables,
  renderBodyPreview,
  type TemplateVariables,
  type WhatsAppTemplate,
} from '@/lib/whatsapp/templates'

/** Keep the fan-out small — Meta throttles hard on bursts. */
const CONCURRENCY = 5

export interface TemplateListResult {
  templates: WhatsAppTemplate[]
  error?: string
}

export interface SendTemplateInput {
  templateName: string
  language: string
  variables: TemplateVariables
  /** Raw entries as typed by the admin; normalised server-side. */
  phones: string[]
  countryCode?: string
  /** Every send is filed under a campaign. */
  campaignId: string
  /**
   * Normalised phone -> customer id, for recipients picked from the records.
   * Lets the customer drilldown show what that customer was sent.
   */
  customerIds?: Record<string, string>
}

export interface SendTemplateResult {
  sent?: number
  failed?: number
  /** Per-recipient failures, so the admin can fix and retry just those. */
  failures?: { phone: string; error: string }[]
  error?: string
}

export interface WhatsAppMessageRecord {
  id: string
  to_phone: string
  template_name: string
  template_language: string
  body_preview: string | null
  status: MessageStatus
  message_id: string | null
  error: string | null
  created_at: string
  campaign_name: string | null
}

export interface WhatsAppMessageFilters {
  from?: string // yyyy-mm-dd, inclusive
  to?: string // yyyy-mm-dd, inclusive
  search?: string // phone number / template name
  status?: MessageStatus
  templateName?: string
  campaignId?: string
  page?: number // 1-based
  pageSize?: number
}

export interface WhatsAppMessagePage {
  rows: WhatsAppMessageRecord[]
  total: number
}

/** Approved templates on the WABA, ready to be picked in the UI. */
export async function getTemplates(): Promise<TemplateListResult> {
  try {
    await requireAdmin()
  } catch {
    return { templates: [], error: 'Not authorized' }
  }

  const { templates, error } = await fetchTemplates()
  const approved = templates
    ?.filter((t) => t?.status?.toUpperCase() === 'APPROVED')
    ?.sort((a, b) => a.name.localeCompare(b.name))

  return { templates: approved ?? [], error }
}

export async function sendTemplateMessages(
  input: SendTemplateInput
): Promise<SendTemplateResult> {
  let user
  try {
    user = await requireAdmin()
  } catch {
    return { error: 'Not authorized' }
  }

  if (!input?.campaignId) return { error: 'Select a campaign before sending' }

  const supabase = createAdminClient()
  const { data: campaign } = await supabase
    .from('whatsapp_campaigns')
    .select('id')
    .eq('id', input.campaignId)
    .maybeSingle()
  if (!campaign) return { error: 'Campaign not found — refresh the page' }

  const { templates, error: templatesError } = await fetchTemplates()
  if (templatesError && !templates?.length) return { error: templatesError }

  const template = templates?.find(
    (t) => t.name === input?.templateName && t.language === input?.language
  )
  if (!template) return { error: 'Template not found — refresh the template list' }

  const missing = missingVariables(template, input?.variables)
  if (missing.length) return { error: `Fill in: ${missing.join(', ')}` }

  const countryCode = input?.countryCode || DEFAULT_COUNTRY_CODE
  const invalid: string[] = []
  const phones: string[] = []
  for (const raw of input?.phones ?? []) {
    const normalized = normalizePhone(raw, countryCode)
    if (!normalized) invalid.push(raw)
    else if (!phones.includes(normalized)) phones.push(normalized)
  }

  if (invalid.length) return { error: `Invalid phone number(s): ${invalid.join(', ')}` }
  if (!phones.length) return { error: 'Add at least one phone number' }
  if (phones.length > MAX_RECIPIENTS) {
    return { error: `Send to at most ${MAX_RECIPIENTS} numbers at a time` }
  }

  const components = buildTemplateComponents(template, input.variables)
  const bodyPreview = renderBodyPreview(template, input.variables)
  const batchId = randomUUID()

  const rows: Record<string, unknown>[] = new Array(phones.length)
  let cursor = 0

  const worker = async () => {
    while (cursor < phones.length) {
      const index = cursor++
      const phone = phones[index]
      const res = await sendTemplate(phone, template.name, template.language, components)
      rows[index] = {
        batch_id: batchId,
        to_phone: phone,
        template_name: template.name,
        template_language: template.language,
        body_preview: bodyPreview || null,
        status: res.ok ? 'sent' : 'failed',
        message_id: res.messageId ?? null,
        error: res.error ?? null,
        campaign_id: input.campaignId,
        customer_id: input.customerIds?.[phone] ?? null,
        sent_by: user.id,
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, phones.length) }, worker))

  await supabase.from('whatsapp_messages').insert(rows)

  const failures = rows
    .filter((r) => r.status === 'failed')
    .map((r) => ({ phone: String(r.to_phone), error: String(r.error ?? 'Send failed') }))

  revalidatePath('/admin/whatsapp')
  revalidatePath('/admin/whatsapp/campaigns')
  return { sent: rows.length - failures.length, failed: failures.length, failures }
}

export async function getWhatsappMessagesPage(
  filters: WhatsAppMessageFilters
): Promise<WhatsAppMessagePage> {
  try {
    await requireAdmin()
  } catch {
    return { rows: [], total: 0 }
  }

  const supabase = createAdminClient()
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 25
  const page = filters.page && filters.page > 0 ? filters.page : 1
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('whatsapp_messages')
    .select(
      'id, to_phone, template_name, template_language, body_preview, status, message_id, error, created_at, whatsapp_campaigns(name)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })

  if (filters.from) query = query.gte('created_at', `${filters.from}T00:00:00`)
  if (filters.to) query = query.lte('created_at', `${filters.to}T23:59:59`)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.templateName) query = query.eq('template_name', filters.templateName)
  if (filters.campaignId) query = query.eq('campaign_id', filters.campaignId)

  const search = filters.search?.trim()
  if (search) {
    // Escape PostgREST's `or` list separators so a search term cannot alter the filter.
    const term = search.replace(/[(),\\]/g, ' ').trim()
    if (term) {
      query = query.or(`to_phone.ilike.%${term}%,template_name.ilike.%${term}%`)
    }
  }

  const { data, count, error } = await query.range(offset, offset + pageSize - 1)
  if (error) return { rows: [], total: 0 }

  const rows = (data ?? []).map((d: any) => {
    const { whatsapp_campaigns, ...rest } = d
    const campaign = Array.isArray(whatsapp_campaigns) ? whatsapp_campaigns[0] : whatsapp_campaigns
    return { ...rest, campaign_name: campaign?.name ?? null } as WhatsAppMessageRecord
  })

  return { rows, total: count ?? 0 }
}
