'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/roles'
import { SENT_STATUSES } from '@/lib/whatsapp/status'

export interface Campaign {
  id: string
  name: string
  description: string | null
  starts_on: string | null
  ends_on: string | null
  created_at: string
}

export interface CampaignWithStats extends Campaign {
  sent: number
  failed: number
  /** Distinct templates used under this campaign. */
  templates: string[]
  lastSentAt: string | null
}

/** Just enough to fill the campaign dropdown on the send card. */
export interface CampaignOption {
  id: string
  name: string
}

export interface CampaignFilters {
  search?: string // name or description
  page?: number // 1-based
  pageSize?: number
}

export interface CampaignPage {
  rows: CampaignWithStats[]
  total: number
}

export interface CampaignInput {
  name: string
  description?: string
  startsOn?: string // yyyy-mm-dd
  endsOn?: string // yyyy-mm-dd
}

/** One row of the campaign detail view: "25 Aug 2026 — book_promo — 250 sent". */
export interface CampaignSendGroup {
  date: string // yyyy-mm-dd
  templateName: string
  templateLanguage: string
  sent: number
  failed: number
}

export interface CampaignDetail {
  campaign: Campaign
  groups: CampaignSendGroup[]
  totals: { sent: number; failed: number; recipients: number }
}

const CAMPAIGN_COLUMNS = 'id, name, description, starts_on, ends_on, created_at'

export async function getCampaignOptions(): Promise<CampaignOption[]> {
  try {
    await requireAdmin()
  } catch {
    return []
  }

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('whatsapp_campaigns')
    .select('id, name')
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function getCampaignsPage(filters: CampaignFilters): Promise<CampaignPage> {
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
    .from('whatsapp_campaigns')
    .select(CAMPAIGN_COLUMNS, { count: 'exact' })
    .order('created_at', { ascending: false })

  const search = filters.search?.trim()
  if (search) {
    // Escape PostgREST's `or` list separators so a search term cannot alter the filter.
    const term = search.replace(/[(),\\]/g, ' ').trim()
    if (term) query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`)
  }

  const { data: campaigns, count, error } = await query.range(offset, offset + pageSize - 1)
  if (error) return { rows: [], total: 0 }
  if (!campaigns?.length) return { rows: [], total: count ?? 0 }

  // Stats are only aggregated for the campaigns on this page.
  const { data: messages } = await supabase
    .from('whatsapp_messages')
    .select('campaign_id, template_name, status, created_at')
    .in(
      'campaign_id',
      campaigns.map((c) => c.id)
    )

  const stats = new Map<string, { sent: number; failed: number; templates: Set<string>; lastSentAt: string | null }>()
  for (const m of messages ?? []) {
    if (!m.campaign_id) continue
    let s = stats.get(m.campaign_id)
    if (!s) {
      s = { sent: 0, failed: 0, templates: new Set<string>(), lastSentAt: null }
      stats.set(m.campaign_id, s)
    }
    if (SENT_STATUSES.includes(m.status)) s.sent += 1
    else s.failed += 1
    s.templates.add(m.template_name)
    if (!s.lastSentAt || m.created_at > s.lastSentAt) s.lastSentAt = m.created_at
  }

  const rows = campaigns.map((c) => {
    const s = stats.get(c.id)
    return {
      ...c,
      sent: s?.sent ?? 0,
      failed: s?.failed ?? 0,
      templates: s ? Array.from(s.templates).sort() : [],
      lastSentAt: s?.lastSentAt ?? null,
    }
  })

  return { rows, total: count ?? rows.length }
}

export async function createCampaign(
  input: CampaignInput
): Promise<{ id?: string; error?: string }> {
  let user
  try {
    user = await requireAdmin()
  } catch {
    return { error: 'Not authorized' }
  }

  const name = input?.name?.trim()
  if (!name) return { error: 'Campaign name is required' }
  if (input?.startsOn && input?.endsOn && input.endsOn < input.startsOn) {
    return { error: 'End date cannot be before the start date' }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('whatsapp_campaigns')
    .insert({
      name,
      description: input?.description?.trim() || null,
      starts_on: input?.startsOn || null,
      ends_on: input?.endsOn || null,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/admin/whatsapp')
  revalidatePath('/admin/whatsapp/campaigns')
  return { id: data.id }
}

export async function getCampaignDetail(id: string): Promise<CampaignDetail | null> {
  try {
    await requireAdmin()
  } catch {
    return null
  }

  const supabase = createAdminClient()
  const { data: campaign } = await supabase
    .from('whatsapp_campaigns')
    .select(CAMPAIGN_COLUMNS)
    .eq('id', id)
    .maybeSingle()
  if (!campaign) return null

  const { data: messages } = await supabase
    .from('whatsapp_messages')
    .select('to_phone, template_name, template_language, status, created_at')
    .eq('campaign_id', id)
    .order('created_at', { ascending: false })

  const map = new Map<string, CampaignSendGroup>()
  const recipients = new Set<string>()
  let sent = 0
  let failed = 0

  for (const m of messages ?? []) {
    const date = String(m.created_at).slice(0, 10)
    const key = `${date}|${m.template_name}|${m.template_language}`
    let g = map.get(key)
    if (!g) {
      g = {
        date,
        templateName: m.template_name,
        templateLanguage: m.template_language,
        sent: 0,
        failed: 0,
      }
      map.set(key, g)
    }
    if (SENT_STATUSES.includes(m.status)) {
      g.sent += 1
      sent += 1
    } else {
      g.failed += 1
      failed += 1
    }
    recipients.add(m.to_phone)
  }

  const groups = Array.from(map.values()).sort(
    (a, b) => b.date.localeCompare(a.date) || a.templateName.localeCompare(b.templateName)
  )

  return { campaign, groups, totals: { sent, failed, recipients: recipients.size } }
}
