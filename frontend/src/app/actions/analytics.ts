'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function logVisit(sessionId: string, path: string) {
  try {
    const supabase = createClient()
    const headerList = headers()
    const userAgent = headerList.get('user-agent')
    const referrer = headerList.get('referer')

    const { error } = await supabase
      .from('site_visits')
      .insert([
        {
          session_id: sessionId,
          path,
          user_agent: userAgent,
          referrer: referrer
        }
      ])

    if (error) {
      console.error('Supabase error logging visit:', error)
      throw error
    }
    
    console.log(`Visit logged successfully: ${path} (Session: ${sessionId})`)
    return { success: true }
  } catch (error) {
    console.error('Error in logVisit action:', error)
    return { error: 'Failed to log visit' }
  }
}

export async function getAnalytics() {
  try {
    const supabase = createClient()
    
    // Total visits
    const { count: totalVisits } = await supabase
      .from('site_visits')
      .select('*', { count: 'exact', head: true })

    // Unique sessions (Total viewers)
    const { data: uniqueSessions } = await supabase
      .from('site_visits')
      .select('session_id')
    
    const uniqueSessionCount = new Set(uniqueSessions?.map(s => s.session_id)).size

    // Visits by path
    const { data: pathData } = await supabase
      .from('site_visits')
      .select('path')
    
    const pathCounts: Record<string, number> = {}
    pathData?.forEach(v => {
      pathCounts[v.path] = (pathCounts[v.path] || 0) + 1
    })

    // Last 7 days visits (grouped by day)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: lastSevenDays } = await supabase
      .from('site_visits')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString())

    const dailyVisits: Record<string, number> = {}
    lastSevenDays?.forEach(v => {
      const date = new Date(v.created_at).toLocaleDateString()
      dailyVisits[date] = (dailyVisits[date] || 0) + 1
    })

    // Monthly visits (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: lastSixMonths } = await supabase
      .from('site_visits')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString())

    const monthlyVisits: Record<string, number> = {}
    lastSixMonths?.forEach(v => {
      const date = new Date(v.created_at)
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' })
      monthlyVisits[monthYear] = (monthlyVisits[monthYear] || 0) + 1
    })

    return {
      totalVisits: totalVisits || 0,
      uniqueSessions: uniqueSessionCount,
      pathCounts: Object.entries(pathCounts).sort((a, b) => b[1] - a[1]).slice(0, 10),
      dailyVisits: Object.entries(dailyVisits),
      monthlyVisits: Object.entries(monthlyVisits)
    }
  } catch (error) {
    console.error('Error getting analytics:', error)
    return { error: 'Failed to fetch analytics' }
  }
}
