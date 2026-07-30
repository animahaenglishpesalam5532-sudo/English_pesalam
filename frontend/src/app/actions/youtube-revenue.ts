'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/roles'
import { revalidatePath } from 'next/cache'

// ------------------------------------------------------------------ types

export interface YoutubeRevenueRow {
  id: string
  earned_on: string // 'YYYY-MM-DD'
  revenue: number
  created_at: string
}

export interface YoutubeRevenueFilters {
  from?: string // 'YYYY-MM-DD' (inclusive)
  to?: string // 'YYYY-MM-DD' (inclusive)
}

export interface YoutubeRevenueData {
  rows: YoutubeRevenueRow[] // rows within the selected range, newest first
  byDay: { date: string; revenue: number }[] // chart series (ascending)
  totalInRange: number
  last7: number
  last30: number
  allTime: number
}

// ------------------------------------------------------------------ helpers

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10)
}

// ------------------------------------------------------------------ read

export async function getYoutubeRevenue(
  filters: YoutubeRevenueFilters = {}
): Promise<YoutubeRevenueData> {
  const supabase = await createClient()

  // Volume is low (one row per day), so fetch everything and compute in memory.
  const { data, error } = await supabase
    .from('youtube_revenue')
    .select('id, earned_on, revenue, created_at')
    .order('earned_on', { ascending: false })

  const all: YoutubeRevenueRow[] = (data && !error ? data : []).map((r: any) => ({
    id: r.id,
    earned_on: r.earned_on,
    revenue: Number(r.revenue ?? 0),
    created_at: r.created_at,
  }))

  const from = filters.from || ''
  const to = filters.to || ''
  const inRange = all.filter(
    (r) => (!from || r.earned_on >= from) && (!to || r.earned_on <= to)
  )

  // Aggregate by day for the chart (one row per date already, but sum defensively).
  const dayMap = new Map<string, number>()
  for (const r of inRange) dayMap.set(r.earned_on, (dayMap.get(r.earned_on) ?? 0) + r.revenue)
  const byDay = Array.from(dayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      revenue,
    }))

  const totalInRange = inRange.reduce((a, r) => a + r.revenue, 0)
  const allTime = all.reduce((a, r) => a + r.revenue, 0)

  // Rolling windows relative to today (independent of the selected filter range).
  const today = new Date()
  const d7 = new Date(today)
  d7.setDate(d7.getDate() - 6) // last 7 days = today + previous 6
  const d30 = new Date(today)
  d30.setDate(d30.getDate() - 29)
  const from7 = ymd(d7)
  const from30 = ymd(d30)
  const todayYmd = ymd(today)

  const last7 = all
    .filter((r) => r.earned_on >= from7 && r.earned_on <= todayYmd)
    .reduce((a, r) => a + r.revenue, 0)
  const last30 = all
    .filter((r) => r.earned_on >= from30 && r.earned_on <= todayYmd)
    .reduce((a, r) => a + r.revenue, 0)

  return { rows: inRange, byDay, totalInRange, last7, last30, allTime }
}

// ------------------------------------------------------------------ write

export async function addYoutubeRevenue(input: {
  earnedOn: string // 'YYYY-MM-DD'
  revenue: number
}): Promise<{ success?: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin' || !user.isActive) return { error: 'Not authorized' }

  const earnedOn = (input.earnedOn || '').trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(earnedOn)) return { error: 'A valid date is required' }
  const revenue = Number(input.revenue)
  if (!Number.isFinite(revenue) || revenue < 0) return { error: 'Revenue must be zero or more' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('youtube_revenue')
    .insert({ earned_on: earnedOn, revenue, created_by: user.id })
  if (error) return { error: error.message }

  revalidatePath('/admin/youtube-revenue')
  return { success: true }
}

export async function deleteYoutubeRevenue(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin' || !user.isActive) return { error: 'Not authorized' }

  const supabase = await createClient()
  const { error } = await supabase.from('youtube_revenue').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/youtube-revenue')
  return { success: true }
}
