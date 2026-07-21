'use client'

import type { TopProduct } from '@/app/actions/sales-analytics'

const fmtMoney = (n: number) => `₹${Number(n ?? 0).toLocaleString('en-IN')}`

const TYPE_BADGE: Record<string, string> = {
  book: 'bg-emerald-100 text-emerald-700',
  pdf: 'bg-amber-100 text-amber-700',
  ppt: 'bg-orange-100 text-orange-700',
  video_course: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-600',
}

export default function TopProducts({ data }: { data: TopProduct[] }) {
  const products = data ?? []
  const maxRevenue = products.reduce((m, p) => Math.max(m, p?.revenue ?? 0), 0)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Top products (by revenue)</h3>

      {products.length === 0 ? (
        <p className="text-sm text-gray-400">No purchases in range.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p, i) => (
            <div key={p?.key ?? i} className="flex items-center gap-3">
              <span className="w-5 shrink-0 text-xs text-gray-400 text-right">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-gray-900" title={p?.title}>
                    {p?.title ?? 'Unknown'}
                  </span>
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_BADGE[p?.type] ?? TYPE_BADGE.other}`}>
                    {p?.type ?? 'other'}
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${maxRevenue > 0 ? Math.round(((p?.revenue ?? 0) / maxRevenue) * 100) : 0}%` }}
                  />
                </div>
              </div>
              <div className="w-24 shrink-0 text-right">
                <p className="text-sm font-semibold text-gray-900">{fmtMoney(p?.revenue ?? 0)}</p>
                <p className="text-xs text-gray-400">{(p?.units ?? 0).toLocaleString('en-IN')} sold</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
