'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Search } from 'lucide-react'
import CustomerDrilldown from './CustomerDrilldown'
import RecordsTabs from './RecordsTabs'
import DateField from './DateField'
import { TableSkeleton, Pagination } from './TableUI'
import { InteractionModal, type EntryFormValues } from './InteractionModal'
import {
  updateInteraction,
  type RegisterRow,
  type RegisterFilters,
  type StaffOption,
  type EntryProducts,
  type Category,
  type CallType,
} from '@/app/actions/sales'

const CATEGORY_LABEL: Record<Category, string> = {
  general: 'General',
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
function isoToLocalInput(iso: string) {
  const d = new Date(iso)
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

interface Props {
  rows: RegisterRow[]
  total: number
  staffOptions: StaffOption[]
  products: EntryProducts
  filters: RegisterFilters
  showStaffFilter?: boolean
}

export default function RecordsView({ rows, total, staffOptions, products, filters, showStaffFilter = false }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [f, setF] = useState<RegisterFilters>(filters)
  const [drilldownId, setDrilldownId] = useState<string | null>(null)
  const [editRow, setEditRow] = useState<RegisterRow | null>(null)

  const page = filters.page && filters.page > 0 ? filters.page : 1
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 25

  const navigate = (next: RegisterFilters) => {
    const params = new URLSearchParams()
    if (next.from) params.set('from', next.from)
    if (next.to) params.set('to', next.to)
    if (next.category && next.category !== 'all') params.set('category', next.category)
    if (next.callType && next.callType !== 'all') params.set('callType', next.callType)
    if (next.staffId && next.staffId !== 'all') params.set('staffId', next.staffId)
    if (next.search?.trim()) params.set('search', next.search.trim())
    if (next.sort) params.set('sort', next.sort)
    if (next.onlyLeads) params.set('onlyLeads', '1')
    if (next.page && next.page > 1) params.set('page', String(next.page))
    if (next.pageSize && next.pageSize !== 25) params.set('pageSize', String(next.pageSize))
    startTransition(() => router.push(`/admin/records?${params.toString()}`))
  }

  // Changing filters resets to the first page.
  const applyFilters = (next: RegisterFilters) => navigate({ ...next, page: 1 })

  const quickRange = (days: number | 'all') => {
    if (days === 'all') {
      applyFilters({ ...f, from: '', to: '' })
      return
    }
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)
    applyFilters({ ...f, from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) })
  }

  // Highlight whichever quick-range pill matches the currently applied dates.
  const todayISO = new Date().toISOString().slice(0, 10)
  const rangeIsActive = (days: number) => {
    const from = new Date()
    from.setDate(from.getDate() - days)
    return (filters.from ?? '') === from.toISOString().slice(0, 10) && (filters.to ?? '') === todayISO
  }
  const allTimeActive = !filters.from && !filters.to

  const handleEditSubmit = async (values: EntryFormValues) => {
    if (!editRow) return
    return updateInteraction(editRow.id, {
      name: values.name,
      items: values.items,
      notes: values.notes,
      callType: values.callType,
      amount: values.callType === 'purchase' ? parseFloat(values.amount) : null,
      callAt: new Date(values.callAt).toISOString(),
    }).then((res) => {
      if (!res.error) router.refresh()
      return res
    })
  }

  const selectCls = 'px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Records</h1>
        <p className="mt-1 text-sm text-gray-500">All calls, inquiries and purchases. Click a phone to see the full customer history; use the pencil to edit.</p>
      </div>

      <RecordsTabs active="records" />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <DateField className={`${selectCls} cursor-pointer`} value={f.from ?? ''} onChange={(v) => setF({ ...f, from: v })} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <DateField className={`${selectCls} cursor-pointer`} value={f.to ?? ''} onChange={(v) => setF({ ...f, to: v })} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select className={selectCls} value={f.category ?? 'all'} onChange={(e) => setF({ ...f, category: e.target.value as Category | 'all' })}>
              <option value="all">All</option>
              <option value="general">General</option>
              <option value="book">Book</option>
              <option value="pdf_ppt">PDF &amp; PPT</option>
              <option value="video_course">Video Course</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Type</label>
            <select className={selectCls} value={f.callType ?? 'all'} onChange={(e) => setF({ ...f, callType: e.target.value as CallType | 'all' })}>
              <option value="all">All</option>
              <option value="inquiry">Inquiry</option>
              <option value="purchase">Purchase</option>
            </select>
          </div>
          {showStaffFilter && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Salesperson</label>
              <select className={selectCls} value={f.staffId ?? 'all'} onChange={(e) => setF({ ...f, staffId: e.target.value })}>
                <option value="all">All</option>
                {staffOptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sort</label>
            <select className={selectCls} value={f.sort ?? 'recent'} onChange={(e) => setF({ ...f, sort: e.target.value as RegisterFilters['sort'] })}>
              <option value="recent">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="amount_desc">Highest amount</option>
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs text-gray-500 mb-1">Search name / phone</label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                className={`${selectCls} w-full pl-9`}
                value={f.search ?? ''}
                onChange={(e) => setF({ ...f, search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters(f)}
                placeholder="Search..."
              />
            </div>
          </div>
          <button
            onClick={() => applyFilters(f)}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Apply
          </button>
        </div>

        <label className="mt-3 flex w-fit items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={!!f.onlyLeads}
            onChange={(e) => {
              const next = { ...f, onlyLeads: e.target.checked }
              setF(next)
              applyFilters(next)
            }}
          />
          Only leads — enquired but never purchased
        </label>

        <div className="flex flex-wrap gap-2 mt-3">
          {([['Today', 0], ['7 days', 7], ['30 days', 30], ['90 days', 90], ['1 year', 365]] as [string, number][]).map(
            ([label, days]) => (
              <button
                key={label}
                onClick={() => quickRange(days)}
                className={`px-3 py-1 text-xs rounded-full ${
                  rangeIsActive(days)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            )
          )}
          <button
            onClick={() => quickRange('all')}
            className={`px-3 py-1 text-xs rounded-full ${
              allTimeActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All time
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Records</h3>
          <span className="text-sm text-gray-500">{total} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Date & time', 'Name', 'Phone', 'Category', 'Type', 'Products', 'Amount', 'Salesperson', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            {isPending ? (
              <TableSkeleton cols={9} rows={pageSize > 12 ? 12 : pageSize} />
            ) : (
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-sm text-gray-500">
                    No records for the selected filters.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{fmtDate(r.call_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{r.name || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button onClick={() => setDrilldownId(r.customer_id)} className="text-blue-600 hover:underline font-medium">
                        {r.phone}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{CATEGORY_LABEL[r.category]}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          r.call_type === 'purchase' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {r.call_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate" title={r.items.map((i) => i.title).join(', ')}>
                      {r.items.length ? r.items.map((i) => i.title).join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {r.amount != null ? fmtMoney(r.amount) : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{r.staff_name || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => setEditRow(r)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            )}
          </table>
        </div>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          disabled={isPending}
          onPage={(p) => navigate({ ...filters, page: p, pageSize })}
          onPageSize={(n) => navigate({ ...filters, page: 1, pageSize: n })}
        />
      </div>

      <CustomerDrilldown customerId={drilldownId} onClose={() => setDrilldownId(null)} />

      {editRow && (
        <InteractionModal
          isOpen={!!editRow}
          onClose={() => setEditRow(null)}
          category={editRow.category}
          title={`Edit — ${CATEGORY_LABEL[editRow.category]}`}
          products={products}
          mode="edit"
          initial={{
            phone: editRow.phone,
            name: editRow.name ?? '',
            items: editRow.items,
            notes: editRow.notes ?? '',
            callType: editRow.call_type,
            amount: editRow.amount != null ? String(editRow.amount) : '',
            callAt: isoToLocalInput(editRow.call_at),
          }}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  )
}
