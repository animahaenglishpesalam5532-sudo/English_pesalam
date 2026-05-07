'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { logVisit } from '@/app/actions/analytics'

export function ViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Ignore private/admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
      return
    }

    // Generate or get a session ID that lasts until the tab is closed
    // sessionStorage is perfect because it persists on refresh but clears on tab close
    let sessionId = sessionStorage.getItem('site_session_id')
    
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      sessionStorage.setItem('site_session_id', sessionId)
      
      // Only log once per session per tab
      logVisit(sessionId, pathname).then(res => {
        if (res.error) console.error('Tracking error:', res.error)
        else console.log('Session tracking initialized')
      })
    }
    
    // Note: We are only logging the INITIAL entry to the site in this session.
    // If the user navigates, we don't log again (per user request: "if they navigate, count should not add")
    // If the user refreshes, sessionId exists in sessionStorage, so it won't log again.
    
  }, [pathname])

  return null
}
