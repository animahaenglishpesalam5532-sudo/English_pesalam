'use client'

import type { HeatmapData } from '@/app/actions/sales-analytics'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function CallHeatmap({ data }: { data: HeatmapData }) {
  const grid = data?.rows ?? []
  const total = data?.total ?? 0

  // Collapse each weekday's 24 hourly buckets into a single daily total. The
  // imported rows carry a fixed timestamp, so the hour is unreliable — only the
  // weekday is meaningful.
  const byDay = DAYS.map((day, d) => ({
    day,
    count: (grid?.[d] ?? []).reduce((s, c) => s + (c ?? 0), 0),
  }))
  const maxDay = byDay.reduce((m, x) => Math.max(m, x.count), 0)
  const peak = byDay.reduce((best, x) => (x.count > best.count ? x : best), { day: '', count: 0 })

  const intensity = (count: number) => {
    if (!count || maxDay <= 0) return { backgroundColor: 'rgba(100, 116, 139, 0.12)' }
    const ratio = count / maxDay
    return { backgroundColor: `rgba(37, 99, 235, ${0.15 + ratio * 0.85})` }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Best day to reach — activity by weekday</h3>
        {peak.count > 0 && (
          <span className="text-xs text-gray-500">
            Peak: {peak.day} ({peak.count})
          </span>
        )}
      </div>

      {total === 0 ? (
        <p className="text-sm text-gray-400">No activity in range.</p>
      ) : (
        <div className="space-y-2">
          {byDay.map(({ day, count }) => (
            <div key={day} className="flex items-center gap-3 text-sm">
              <span className="w-10 shrink-0 text-gray-600">{day}</span>
              <div className="flex-1 h-6 rounded bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded flex items-center justify-end pr-2"
                  style={{ ...intensity(count), width: `${maxDay > 0 ? Math.max((count / maxDay) * 100, count > 0 ? 6 : 0) : 0}%` }}
                >
                  {count > 0 && <span className="text-xs font-medium text-white">{count.toLocaleString('en-IN')}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-400">
        Darker/longer = more inquiries and purchases logged on that weekday. Time of day is omitted because imported
        historical rows use a fixed timestamp, so only the weekday is reliable.
      </p>
    </div>
  )
}
