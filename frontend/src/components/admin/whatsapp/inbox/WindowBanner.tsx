'use client'

import React, { useEffect, useState } from 'react'
import { Clock, Lock } from 'lucide-react'
import { formatWindowRemaining, windowRemainingMs } from '@/lib/whatsapp/window'

interface Props {
  lastInboundAt: string | null
  /** Forced shut because Meta rejected a send with 131047. */
  forcedClosed?: boolean
}

/**
 * The countdown on Meta's 24-hour customer service window. Ticks locally so the
 * admin can see the window closing without pressing Refresh — but the server
 * re-checks before every send, so this display is advisory only.
 */
export function WindowBanner({ lastInboundAt, forcedClosed }: Props) {
  const [remaining, setRemaining] = useState(() => windowRemainingMs(lastInboundAt))

  useEffect(() => {
    setRemaining(windowRemainingMs(lastInboundAt))
    const timer = setInterval(() => setRemaining(windowRemainingMs(lastInboundAt)), 30_000)
    return () => clearInterval(timer)
  }, [lastInboundAt])

  const open = remaining > 0 && !forcedClosed

  if (!open) {
    return (
      <div className="flex items-center gap-2 border-b border-gray-100 bg-amber-50 px-4 py-2 text-xs text-amber-800">
        <Lock className="h-3.5 w-3.5 shrink-0" />
        <span>
          The 24-hour reply window has closed. Only an approved template can be sent until this
          customer messages again.
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 border-b border-gray-100 bg-emerald-50 px-4 py-2 text-xs text-emerald-800">
      <Clock className="h-3.5 w-3.5 shrink-0" />
      <span>
        You can reply freely for another{' '}
        <strong className="font-semibold">{formatWindowRemaining(remaining)}</strong>.
      </span>
    </div>
  )
}
