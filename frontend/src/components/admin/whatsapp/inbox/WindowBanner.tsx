'use client'

import React from 'react'
import { Clock, Lock } from 'lucide-react'
import { formatWindowRemaining } from '@/lib/whatsapp/window'

interface Props {
  /** Milliseconds left, from useWindowCountdown — the same value gating the composer. */
  remaining: number
  /** Forced shut because Meta rejected a send with 131047. */
  forcedClosed?: boolean
}

/**
 * The countdown on Meta's 24-hour customer service window. Advisory only: the
 * server re-checks before every send, so a stale tab cannot slip one through.
 */
export function WindowBanner({ remaining, forcedClosed }: Props) {
  // `!(remaining > 0)` mirrors ChatThread's `canReply = remaining > 0` exactly,
  // so a NaN can never leave the banner green while the composer is disabled.
  if (!(remaining > 0) || forcedClosed) {
    return (
      <div className="flex items-center gap-2 border-b border-gray-100 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 sm:px-4 sm:text-xs">
        <Lock className="h-3.5 w-3.5 shrink-0" />
        <span>
          The 24-hour reply window has closed. Only an approved template can be sent until this
          customer messages again.
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 border-b border-gray-100 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800 sm:px-4 sm:text-xs">
      <Clock className="h-3.5 w-3.5 shrink-0" />
      <span>
        You can reply freely for another{' '}
        <strong className="font-semibold">{formatWindowRemaining(remaining)}</strong>.
      </span>
    </div>
  )
}
