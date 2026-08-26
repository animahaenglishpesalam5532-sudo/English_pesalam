'use client'

import { useEffect, useState } from 'react'
import { windowRemainingMs } from '@/lib/whatsapp/window'

/**
 * Milliseconds left in Meta's 24h reply window, re-evaluated on a timer.
 *
 * Shared by the banner and the composer deliberately. When each owned its own
 * clock the banner would flip to "session ended" while the composer, whose
 * parent had not re-rendered, stayed enabled — so the admin could type a reply
 * that the server was always going to refuse.
 */
export function useWindowCountdown(lastInboundAt: string | null | undefined): number {
  const [remaining, setRemaining] = useState(() => windowRemainingMs(lastInboundAt))

  useEffect(() => {
    const tick = () => setRemaining(windowRemainingMs(lastInboundAt))
    tick()

    // 15s is fine for the "23h 56m" readout, but on its own it would leave the
    // composer live for up to 15s past expiry, so also fire exactly on it.
    const interval = setInterval(tick, 15_000)
    const untilExpiry = windowRemainingMs(lastInboundAt)
    const atExpiry = untilExpiry > 0 ? setTimeout(tick, untilExpiry + 250) : undefined

    return () => {
      clearInterval(interval)
      if (atExpiry) clearTimeout(atExpiry)
    }
  }, [lastInboundAt])

  return remaining
}
