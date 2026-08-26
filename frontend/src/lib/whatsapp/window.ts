// Meta's 24-hour customer service window.
//
// Free-form messages (text, media, interactive cards) may only be sent while
// the window is open — that is, within 24 hours of the customer's most recent
// message to us. Outside it the Cloud API rejects the send and only a
// pre-approved template will get through.
//
// Pure and isomorphic: the server uses it as the authoritative check before
// sending, the composer uses it to count down.

export const WINDOW_MS = 24 * 60 * 60 * 1000

/** When the window shuts, or null when the customer has never messaged us. */
export function windowExpiresAt(lastInboundAt: string | null | undefined): Date | null {
  if (!lastInboundAt) return null
  const at = new Date(lastInboundAt).getTime()
  if (!Number.isFinite(at)) return null
  return new Date(at + WINDOW_MS)
}

/**
 * Milliseconds left before free-form replies stop working. 0 once closed.
 *
 * Guaranteed to return a finite number: callers gate the composer on this, and
 * a NaN leaking out reads as "not closed" in every `<= 0` comparison, which
 * would offer a reply box for a window that has actually shut.
 */
export function windowRemainingMs(
  lastInboundAt: string | null | undefined,
  now: Date = new Date()
): number {
  const expires = windowExpiresAt(lastInboundAt)
  if (!expires) return 0
  const left = expires.getTime() - now.getTime()
  return Number.isFinite(left) ? Math.max(0, left) : 0
}

export function isWindowOpen(
  lastInboundAt: string | null | undefined,
  now: Date = new Date()
): boolean {
  return windowRemainingMs(lastInboundAt, now) > 0
}

/** `5h 12m` / `48m` / `30s` — for the composer banner. */
export function formatWindowRemaining(ms: number): string {
  // `!(ms > 0)` rather than `ms <= 0`: NaN fails every comparison, and falling
  // through with one produces the literal string "NaNs".
  if (!(ms > 0)) return ''
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  if (totalMinutes > 0) return `${totalMinutes}m`
  return `${Math.ceil(ms / 1000)}s`
}
