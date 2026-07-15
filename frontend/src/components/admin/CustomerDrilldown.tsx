'use client'

import React, { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Phone, ShoppingCart, MessageSquare, History } from 'lucide-react'
import { getCustomerTimeline, type CustomerTimeline, type Category } from '@/app/actions/sales'

const CATEGORY_LABEL: Record<Category, string> = {
  general: 'General Inquiry',
  book: 'Book',
  pdf_ppt: 'PDF & PPT',
  video_course: 'Video Course',
}

function fmtMoney(n: number) {
  return `₹${Number(n).toLocaleString('en-IN')}`
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function CustomerDrilldown({
  customerId,
  onClose,
}: {
  customerId: string | null
  onClose: () => void
}) {
  const [data, setData] = useState<CustomerTimeline | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!customerId) {
      setData(null)
      return
    }
    setLoading(true)
    getCustomerTimeline(customerId)
      .then(setData)
      .finally(() => setLoading(false))
  }, [customerId])

  return (
    <Modal
      isOpen={!!customerId}
      onClose={onClose}
      title={data ? `${data.customer.name || 'Customer'} — ${data.customer.phone}` : 'Customer'}
    >
      <div className="max-h-[70vh] overflow-y-auto pr-1">
        {loading && <p className="text-sm text-gray-500 py-6 text-center">Loading...</p>}

        {data && (
          <>
            {/* Totals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <Stat label="Total calls" value={data.totals.calls} icon={Phone} color="text-blue-600 bg-blue-50" />
              <Stat label="Inquiries" value={data.totals.inquiries} icon={MessageSquare} color="text-sky-600 bg-sky-50" />
              <Stat label="Purchases" value={data.totals.purchases} icon={ShoppingCart} color="text-emerald-600 bg-emerald-50" />
              <Stat label="Spent" value={fmtMoney(data.totals.revenue)} icon={ShoppingCart} color="text-purple-600 bg-purple-50" />
            </div>

            {/* Timeline */}
            <ol className="relative border-l border-gray-200 ml-2 space-y-5">
              {data.interactions.map((it) => (
                <li key={it.id} className="ml-4">
                  <span
                    className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full ${
                      it.call_type === 'purchase' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                  />
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-900">{CATEGORY_LABEL[it.category]}</span>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                            it.call_type === 'purchase' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {it.call_type}
                        </span>
                        {it.amount != null && (
                          <span className="text-xs font-semibold text-emerald-700">{fmtMoney(it.amount)}</span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400">{fmtDate(it.call_at)}</span>
                    </div>

                    {it.items.length > 0 && (
                      <p className="mt-1 text-xs text-gray-600">{it.items.map((i) => i.title).join(', ')}</p>
                    )}
                    {it.notes && <p className="mt-1 text-xs text-gray-500 italic">“{it.notes}”</p>}
                    <p className="mt-1 text-[11px] text-gray-400">By {it.staff_name || 'Unknown'}</p>

                    {it.edits.length > 0 && (
                      <div className="mt-2 border-t border-gray-200 pt-2">
                        <p className="flex items-center gap-1 text-[11px] font-medium text-amber-700 mb-1">
                          <History className="w-3 h-3" /> Edit history
                        </p>
                        <ul className="space-y-0.5">
                          {it.edits.map((e, idx) => (
                            <li key={idx} className="text-[11px] text-gray-500">
                              <span className="text-gray-400">{fmtDate(e.edited_at)}:</span>{' '}
                              <span className="font-medium">{e.field}</span>{' '}
                              {e.old_value ? `“${e.old_value}”` : '—'} → {e.new_value ? `“${e.new_value}”` : '—'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </Modal>
  )
}

function Stat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: React.ReactNode
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="rounded-lg border border-gray-100 p-3">
      <div className={`inline-flex p-1.5 rounded-md ${color} mb-1`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-lg font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-[11px] text-gray-500 mt-1">{label}</p>
    </div>
  )
}
