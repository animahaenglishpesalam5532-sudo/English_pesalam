'use client'

import type { FunnelData } from '@/app/actions/sales-analytics'
import type { Category } from '@/app/actions/sales'

const CATEGORY_LABEL: Record<Category, string> = {
  general: 'General',
  book: 'Book',
  pdf_ppt: 'PDF & PPT',
  video_course: 'Video Course',
}

export default function ConversionFunnel({ data }: { data: FunnelData }) {
  const inquiries = data?.inquiries ?? 0
  const purchases = data?.purchases ?? 0
  const total = data?.total ?? 0
  const rate = data?.conversionRate ?? 0
  const inqPct = total > 0 ? Math.round((inquiries / total) * 100) : 0
  const purPct = total > 0 ? Math.round((purchases / total) * 100) : 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Conversion funnel</h3>

      <div className="flex items-end gap-6 mb-5">
        <div>
          <p className="text-3xl font-bold text-gray-900">{rate}%</p>
          <p className="text-xs text-gray-500">Inquiry → purchase</p>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-blue-600">{inquiries.toLocaleString('en-IN')}</span> inquiries ·{' '}
          <span className="font-semibold text-emerald-600">{purchases.toLocaleString('en-IN')}</span> purchases
        </div>
      </div>

      {/* Funnel bars */}
      <div className="space-y-2 mb-6">
        <FunnelBar label="Total contacts" value={total} pct={100} color="bg-gray-400" />
        <FunnelBar label="Inquiries" value={inquiries} pct={inqPct} color="bg-blue-500" />
        <FunnelBar label="Purchases" value={purchases} pct={purPct} color="bg-emerald-500" />
      </div>

      {/* Per-category conversion */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-medium text-gray-500 mb-2">Conversion by category</p>
        <div className="space-y-2">
          {(data?.byCategory ?? []).map((c) => (
            <div key={c?.category} className="flex items-center gap-3 text-sm">
              <span className="w-28 shrink-0 text-gray-600">{CATEGORY_LABEL[c?.category] ?? c?.category}</span>
              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${c?.conversionRate ?? 0}%` }} />
              </div>
              <span className="w-12 text-right font-medium text-gray-900">{c?.conversionRate ?? 0}%</span>
              <span className="w-24 text-right text-xs text-gray-400">
                {c?.purchases ?? 0}/{(c?.purchases ?? 0) + (c?.inquiries ?? 0)}
              </span>
            </div>
          ))}
          {(data?.byCategory?.length ?? 0) === 0 && <p className="text-sm text-gray-400">No data in range.</p>}
        </div>
      </div>
    </div>
  )
}

function FunnelBar({ label, value, pct, color }: { label: string; value: number; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-sm text-gray-600">{label}</span>
      <div className="flex-1 h-6 rounded bg-gray-100 overflow-hidden">
        <div className={`h-full ${color} flex items-center justify-end pr-2`} style={{ width: `${Math.max(pct, 4)}%` }}>
          <span className="text-xs font-medium text-white">{value.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  )
}
