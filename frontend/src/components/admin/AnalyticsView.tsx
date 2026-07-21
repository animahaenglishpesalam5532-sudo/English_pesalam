'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import RecordsTabs from './RecordsTabs'
import DateField from './DateField'
import ConversionFunnel from './analytics/ConversionFunnel'
import NewVsReturning from './analytics/NewVsReturning'
import TopProducts from './analytics/TopProducts'
import CallHeatmap from './analytics/CallHeatmap'
import type { SalesAnalyticsData, SalesAnalyticsFilters } from '@/app/actions/sales-analytics'

interface Props {
  data: SalesAnalyticsData
  filters: SalesAnalyticsFilters
}

export default function AnalyticsView({ data, filters }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [f, setF] = useState<SalesAnalyticsFilters>(filters)

  const apply = (next: SalesAnalyticsFilters) => {
    const params = new URLSearchParams()
    params.set('tab', 'analytics')
    if (next?.from) params.set('from', next.from)
    if (next?.to) params.set('to', next.to)
    startTransition(() => router.push(`/admin/records?${params.toString()}`))
  }

  const quickRange = (days: number | 'all') => {
    if (days === 'all') {
      apply({ from: '', to: '' })
      return
    }
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)
    apply({ from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) })
  }

  const selectCls =
    'px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'

  // Which quick-range pill matches the currently applied filters (from the URL).
  const activePreset: number | 'all' | null = (() => {
    if (!filters?.from && !filters?.to) return 'all'
    if (!filters?.from) return null
    const day = 86400000
    const today = Date.parse(new Date().toISOString().slice(0, 10))
    const toOk = !filters?.to || Math.abs(today - Date.parse(filters.to)) < 2 * day
    if (!toOk) return null
    const days = Math.round((today - Date.parse(filters.from)) / day)
    return [30, 90, 365].includes(days) ? days : null
  })()

  const pillCls = (active: boolean) =>
    `px-3 py-1 text-xs rounded-full ${
      active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">Conversion, customer mix and best times to reach — across all records.</p>
      </div>

      <RecordsTabs active="analytics" />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <DateField className={`${selectCls} cursor-pointer`} value={f?.from ?? ''} onChange={(v) => setF({ ...f, from: v })} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <DateField className={`${selectCls} cursor-pointer`} value={f?.to ?? ''} onChange={(v) => setF({ ...f, to: v })} />
          </div>
          <button
            onClick={() => apply(f)}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? 'Applying…' : 'Apply'}
          </button>

          <div className="flex flex-wrap gap-2">
            {([['30 days', 30], ['90 days', 90], ['1 year', 365]] as [string, number][]).map(([label, days]) => (
              <button key={label} onClick={() => quickRange(days)} className={pillCls(activePreset === days)}>
                {label}
              </button>
            ))}
            <button onClick={() => quickRange('all')} className={pillCls(activePreset === 'all')}>
              All time
            </button>
          </div>
        </div>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionFunnel data={data?.funnel} />
        <NewVsReturning data={data?.newVsReturning} />
        <TopProducts data={data?.topProducts} />
        <div className="lg:col-span-2">
          <CallHeatmap data={data?.heatmap} />
        </div>
      </div>
    </div>
  )
}
