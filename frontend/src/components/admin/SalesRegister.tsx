'use client'

import React, { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Users, IndianRupee, TrendingUp, Pencil, Trash2, Search, Loader2, AlertTriangle } from 'lucide-react'
import SalesCharts, { type Aggregates } from './SalesCharts'
import DateField from './DateField'
import CustomerDrilldown from './CustomerDrilldown'
import { TableSkeleton, Pagination } from './TableUI'
import { InteractionModal, type EntryFormValues } from './InteractionModal'
import {
  updateInteraction,
  deleteInteraction,
  type RegisterRow,
  type RegisterFilters,
  type StaffOption,
  type EntryProducts,
  type Category,
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
  aggregates: Aggregates
  staffOptions: StaffOption[]
  products: EntryProducts
  filters: RegisterFilters
}

export default function SalesRegister({ rows, aggregates, staffOptions, products, filters }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [f, setF] = useState<RegisterFilters>(filters)
  const [drilldownId, setDrilldownId] = useState<string | null>(null)
  const [editRow, setEditRow] = useState<RegisterRow | null>(null)
  const [deleteRow, setDeleteRow] = useState<RegisterRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Charts use the full dataset; the table is paginated client-side.
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  useEffect(() => setPage(1), [rows])
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)

  const applyFilters = (next: RegisterFilters) => {
    const params = new URLSearchParams()
    if (next.from) params.set('from', next.from)
    if (next.to) params.set('to', next.to)
    if (next.categories?.length) params.set('category', next.categories.join(','))
    if (next.callType && next.callType !== 'all') params.set('callType', next.callType)
    if (next.staffId && next.staffId !== 'all') params.set('staffId', next.staffId)
    if (next.search?.trim()) params.set('search', next.search.trim())
    if (next.sort) params.set('sort', next.sort)
    startTransition(() => router.push(`/admin/sales-register?${params.toString()}`))
  }

  // Quick-range pills only fill the From/To fields; the API call fires on Apply.
  const quickRange = (days: number | 'all') => {
    if (days === 'all') {
      setF({ ...f, from: '', to: '' })
      return
    }
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)
    setF({ ...f, from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) })
  }

  // Highlight whichever quick-range pill matches the currently selected dates.
  const todayISO = new Date().toISOString().slice(0, 10)
  const rangeIsActive = (days: number) => {
    const from = new Date()
    from.setDate(from.getDate() - days)
    return (f.from ?? '') === from.toISOString().slice(0, 10) && (f.to ?? '') === todayISO
  }
  const allTimeActive = !f.from && !f.to

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

  const handleDelete = async () => {
    if (!deleteRow) return
    setIsDeleting(true)
    setDeleteError(null)
    const res = await deleteInteraction(deleteRow.id)
    setIsDeleting(false)
    if (res.error) {
      setDeleteError(res.error)
      return
    }
    setDeleteRow(null)
    router.refresh()
  }

  const selectCls = 'px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales Register</h1>
        <p className="mt-1 text-sm text-gray-500">Completed purchases and sales analytics.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Sales" value={aggregates.totalSales} icon={ShoppingCart} color="text-emerald-600 bg-emerald-50" />
        <StatCard label="Revenue" value={fmtMoney(aggregates.revenue)} icon={IndianRupee} color="text-purple-600 bg-purple-50" />
        <StatCard label="Avg Order Value" value={fmtMoney(aggregates.avgOrder)} icon={TrendingUp} color="text-blue-600 bg-blue-50" />
        <StatCard label="Buyers" value={aggregates.uniqueBuyers} icon={Users} color="text-amber-600 bg-amber-50" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        {/* Quick ranges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-medium text-gray-400 mr-1">Quick range</span>
          {([['Today', 0], ['7 days', 7], ['30 days', 30], ['90 days', 90], ['1 year', 365]] as [string, number][]).map(
            ([label, days]) => (
              <button
                key={label}
                onClick={() => quickRange(days)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
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
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              allTimeActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All time
          </button>
        </div>

        {/* Field grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">From</label>
            <DateField className={`${selectCls} w-full cursor-pointer`} value={f.from ?? ''} onChange={(v) => setF({ ...f, from: v })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">To</label>
            <DateField className={`${selectCls} w-full cursor-pointer`} value={f.to ?? ''} onChange={(v) => setF({ ...f, to: v })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Salesperson</label>
            <select className={`${selectCls} w-full`} value={f.staffId ?? 'all'} onChange={(e) => setF({ ...f, staffId: e.target.value })}>
              <option value="all">All</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Sort</label>
            <select className={`${selectCls} w-full`} value={f.sort ?? 'recent'} onChange={(e) => setF({ ...f, sort: e.target.value as RegisterFilters['sort'] })}>
              <option value="recent">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="amount_desc">Highest amount</option>
            </select>
          </div>
        </div>

        {/* Category chips */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Category {(f.categories?.length ?? 0) === 0 && <span className="text-gray-400">(all)</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {(['general', 'book', 'pdf_ppt', 'video_course'] as Category[]).map((c) => {
              const active = (f.categories ?? []).includes(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    const cur = f.categories ?? []
                    const next = active ? cur.filter((x) => x !== c) : [...cur, c]
                    setF({ ...f, categories: next })
                  }}
                  className={`px-3.5 py-1.5 text-sm rounded-full border transition-colors ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Search + Apply */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Search name / phone</label>
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
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? 'Applying…' : 'Apply'}
          </button>
        </div>
      </div>

      {/* Charts */}
      <SalesCharts data={aggregates} />

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Records</h3>
          <span className="text-sm text-gray-500">{rows.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Date & time', 'Name', 'Phone', 'Category', 'Products', 'Amount', 'Salesperson', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            {isPending ? (
              <TableSkeleton cols={8} rows={pageSize > 12 ? 12 : pageSize} />
            ) : (
            <tbody className="divide-y divide-gray-100">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                    No sales for the selected filters.
                  </td>
                </tr>
              ) : (
                pageRows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{fmtDate(r.call_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{r.name || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button onClick={() => setDrilldownId(r.customer_id)} className="text-blue-600 hover:underline font-medium">
                        {r.phone}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{CATEGORY_LABEL[r.category]}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate" title={r.items.map((i) => i.title).join(', ')}>
                      {r.items.length ? r.items.map((i) => i.title).join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {r.amount != null ? fmtMoney(r.amount) : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{r.staff_name || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditRow(r)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setDeleteError(null); setDeleteRow(r) }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
          total={rows.length}
          disabled={isPending}
          onPage={setPage}
          onPageSize={(n) => { setPageSize(n); setPage(1) }}
        />
      </div>

      {deleteRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !isDeleting && setDeleteRow(null)}>
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-full bg-red-50 text-red-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete this record?</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This permanently removes the {CATEGORY_LABEL[deleteRow.category]} record for{' '}
                    <span className="font-medium text-gray-700">{deleteRow.name || deleteRow.phone}</span>
                    {deleteRow.amount != null && <> ({fmtMoney(deleteRow.amount)})</>}. This action cannot be undone.
                  </p>
                </div>
              </div>
              {deleteError && <p className="mt-4 text-sm text-red-600">{deleteError}</p>}
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setDeleteRow(null)}
                disabled={isDeleting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

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

function StatCard({
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  )
}
