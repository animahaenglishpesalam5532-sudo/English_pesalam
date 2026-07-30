'use server'

import { createClient } from '@/lib/supabase/server'
import type { Category, InteractionItem } from './sales'

// ------------------------------------------------------------------ types

export interface SalesAnalyticsFilters {
  from?: string // ISO date (inclusive)
  to?: string // ISO date (inclusive)
  categories?: Category[] // empty/undefined = all categories
}

export interface FunnelData {
  inquiries: number
  purchases: number
  total: number
  conversionRate: number // 0-100
  byCategory: { category: Category; inquiries: number; purchases: number; conversionRate: number }[]
}

export interface NewVsReturningData {
  newBuyers: number
  returningBuyers: number
  newRevenue: number
  returningRevenue: number
  repeatRate: number // returning / distinct buyers, 0-100
  byMonth: { month: string; newBuyers: number; returningBuyers: number }[]
}

export interface TopProduct {
  key: string
  title: string
  type: string
  units: number
  revenue: number
}

export interface HeatmapData {
  // rows[weekday 0=Mon..6=Sun][hour 0..23] = interaction count
  rows: number[][]
  maxCount: number
  total: number
}

export interface SalesAnalyticsData {
  funnel: FunnelData
  newVsReturning: NewVsReturningData
  topProducts: TopProduct[]
  heatmap: HeatmapData
}

// --------------------------------------------------------------- helpers

const CATEGORIES: Category[] = ['general', 'book', 'pdf_ppt', 'video_course']
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000 // India has no DST, so a fixed offset is safe.

// Weekday (0=Mon..6=Sun) and hour (0..23) of an ISO timestamp, in IST.
function istParts(iso: string): { weekday: number; hour: number } {
  const d = new Date(new Date(iso).getTime() + IST_OFFSET_MS)
  const jsDay = d.getUTCDay() // 0=Sun..6=Sat
  const weekday = (jsDay + 6) % 7 // -> 0=Mon..6=Sun
  return { weekday, hour: d.getUTCHours() }
}

function monthKey(iso: string): string {
  return iso?.slice(0, 7) ?? '' // YYYY-MM
}

// ------------------------------------------------------------- main action

// PostgREST caps each response at 1000 rows regardless of .limit(), so we page
// through with .range() until a short page signals the end.
const PAGE_SIZE = 1000

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<{ data: T[] | null }>): Promise<T[]> {
  const out: T[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data } = await build(from, from + PAGE_SIZE - 1)
    const page = data ?? []
    out.push(...page)
    if (page.length < PAGE_SIZE) break
  }
  return out
}

export async function getSalesAnalytics(filters: SalesAnalyticsFilters): Promise<SalesAnalyticsData> {
  const supabase: SupabaseClient = await createClient()
  const cats = filters?.categories?.length ? filters.categories : null

  // In-range interactions drive the funnel, top products and heatmap.
  const rangeQuery = (from: number, to: number) => {
    let q = supabase
      .from('interactions')
      .select('customer_id, category, call_type, amount, items, call_at')
      .order('call_at', { ascending: true })
      .range(from, to)
    if (filters?.from) q = q.gte('call_at', `${filters.from}T00:00:00`)
    if (filters?.to) q = q.lte('call_at', `${filters.to}T23:59:59`)
    if (cats) q = q.in('category', cats)
    return q
  }

  // All-time purchases give each customer's first-ever purchase date, so a
  // purchase in the selected range can be classified new vs returning. When a
  // category filter is active, "first purchase" is scoped to that category, so
  // new/returning reflects the customer's history within the selected category.
  const historyQuery = (from: number, to: number) => {
    let q = supabase
      .from('interactions')
      .select('customer_id, call_at')
      .eq('call_type', 'purchase')
      .order('call_at', { ascending: true })
      .range(from, to)
    if (cats) q = q.in('category', cats)
    return q
  }

  const [rows, history] = await Promise.all([fetchAll(rangeQuery), fetchAll(historyQuery)])

  return {
    funnel: buildFunnel(rows),
    newVsReturning: buildNewVsReturning(rows, history),
    topProducts: buildTopProducts(rows),
    heatmap: buildHeatmap(rows),
  }
}

// ------------------------------------------------------------ builders

function buildFunnel(rows: { category: Category; call_type: string }[]): FunnelData {
  let inquiries = 0
  let purchases = 0
  const cat = new Map<Category, { inquiries: number; purchases: number }>()
  for (const c of CATEGORIES) cat.set(c, { inquiries: 0, purchases: 0 })

  for (const r of rows) {
    const bucket = cat.get(r?.category) ?? { inquiries: 0, purchases: 0 }
    if (r?.call_type === 'purchase') {
      purchases += 1
      bucket.purchases += 1
    } else {
      inquiries += 1
      bucket.inquiries += 1
    }
    cat.set(r?.category, bucket)
  }

  const total = inquiries + purchases
  const rate = (p: number, i: number) => (p + i > 0 ? Math.round((p / (p + i)) * 1000) / 10 : 0)

  return {
    inquiries,
    purchases,
    total,
    conversionRate: rate(purchases, inquiries),
    byCategory: CATEGORIES.map((c) => {
      const b = cat.get(c) ?? { inquiries: 0, purchases: 0 }
      return { category: c, inquiries: b.inquiries, purchases: b.purchases, conversionRate: rate(b.purchases, b.inquiries) }
    }),
  }
}

function buildNewVsReturning(
  rows: { customer_id: string; call_type: string; amount: number | null; call_at: string }[],
  history: { customer_id: string; call_at: string }[]
): NewVsReturningData {
  // First-ever purchase date per customer (across all time).
  const firstPurchase = new Map<string, string>()
  for (const h of history) {
    const prev = firstPurchase.get(h?.customer_id)
    if (!prev || new Date(h?.call_at) < new Date(prev)) firstPurchase.set(h?.customer_id, h?.call_at)
  }

  let newRevenue = 0
  let returningRevenue = 0
  const newBuyers = new Set<string>() // first-ever purchase falls in range
  const returningBuyers = new Set<string>() // made a repeat (non-first) purchase in range
  const distinctBuyers = new Set<string>()
  const newCounted = new Set<string>() // guard so only the true first purchase is "new"
  const months = new Map<string, { newIds: Set<string>; returningIds: Set<string> }>()

  const purchaseRows = rows
    .filter((r) => r?.call_type === 'purchase')
    .sort((a, b) => new Date(a?.call_at).getTime() - new Date(b?.call_at).getTime())

  for (const r of purchaseRows) {
    const cid = r?.customer_id
    const amt = Number(r?.amount ?? 0)
    const first = firstPurchase.get(cid)
    // Their first-ever purchase, and we haven't already counted it (handles
    // same-day duplicate timestamps from imports).
    const isFirstEver = first != null && first === r?.call_at && !newCounted.has(cid)
    if (isFirstEver) newCounted.add(cid)

    distinctBuyers.add(cid)
    const mk = monthKey(r?.call_at)
    const m = months.get(mk) ?? { newIds: new Set<string>(), returningIds: new Set<string>() }

    if (isFirstEver) {
      newRevenue += amt
      newBuyers.add(cid)
      m.newIds.add(cid)
    } else {
      returningRevenue += amt
      returningBuyers.add(cid)
      m.returningIds.add(cid)
    }
    months.set(mk, m)
  }

  const byMonth = Array.from(months.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([mk, v]) => ({
      month: new Date(`${mk}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      newBuyers: v?.newIds?.size ?? 0,
      returningBuyers: v?.returningIds?.size ?? 0,
    }))

  const distinct = distinctBuyers.size
  const repeatRate = distinct > 0 ? Math.round((returningBuyers.size / distinct) * 1000) / 10 : 0

  return {
    newBuyers: newBuyers.size,
    returningBuyers: returningBuyers.size,
    newRevenue,
    returningRevenue,
    repeatRate,
    byMonth,
  }
}

function buildTopProducts(
  rows: { category: Category; call_type: string; amount: number | null; items: InteractionItem[] | null }[]
): TopProduct[] {
  const map = new Map<string, TopProduct>()

  for (const r of rows) {
    if (r?.call_type !== 'purchase') continue
    let items = r?.items ?? []
    // Online-class purchases carry no catalog item; surface them as one product.
    if (items.length === 0 && r?.category === 'video_course') {
      items = [{ type: 'video_course', id: '', title: 'Online Class' }]
    }
    if (items.length === 0) continue

    const amount = Number(r?.amount ?? 0)
    const share = amount / items.length
    for (const it of items) {
      const key = `${it?.type ?? 'other'}:${it?.title ?? 'Unknown'}`
      const entry = map.get(key) ?? { key, title: it?.title ?? 'Unknown', type: it?.type ?? 'other', units: 0, revenue: 0 }
      entry.units += 1
      entry.revenue += share
      map.set(key, entry)
    }
  }

  return Array.from(map.values())
    .map((p) => ({ ...p, revenue: Math.round(p.revenue) }))
    .sort((a, b) => b.revenue - a.revenue || b.units - a.units)
    .slice(0, 15)
}

function buildHeatmap(rows: { call_at: string }[]): HeatmapData {
  const grid: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0))
  let maxCount = 0
  let total = 0

  for (const r of rows) {
    if (!r?.call_at) continue
    const { weekday, hour } = istParts(r.call_at)
    grid[weekday][hour] += 1
    total += 1
    if (grid[weekday][hour] > maxCount) maxCount = grid[weekday][hour]
  }

  return { rows: grid, maxCount, total }
}
