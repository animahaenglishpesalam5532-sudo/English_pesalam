'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Search } from 'lucide-react'
import CustomerDrilldown from './CustomerDrilldown'
import { TableSkeleton, Pagination } from './TableUI'
import { InteractionModal, type EntryFormValues } from './InteractionModal'
import {
  updateInteraction,
  type RegisterRow,
  type RegisterFilters,
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
  total: number
  products: EntryProducts
  filters: RegisterFilters
}

export default function StaffRecords({ rows, total, products, filters }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(filters.search ?? '')
  const [drilldownId, setDrilldownId] = useState<string | null>(null)
  const [editRow, setEditRow] = useState<RegisterRow | null>(null)

  const page = filters.page && filters.page > 0 ? filters.page : 1
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 25

  const navigate = (next: { search?: string; page?: number; pageSize?: number }) => {
    const params = new URLSearchParams()
    if (next.search?.trim()) params.set('search', next.search.trim())
    if (next.page && next.page > 1) params.set('page', String(next.page))
    if (next.pageSize && next.pageSize !== 25) params.set('pageSize', String(next.pageSize))
    startTransition(() => router.push(`/admin/my-records?${params.toString()}`))
  }

  const runSearch = () => navigate({ search, page: 1, pageSize })

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
      if (!res.error) startTransition(() => router.refresh())
      return res
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Records</h1>
        <p className="mt-1 text-sm text-gray-500">Search a customer and edit their calls. Click a phone to see full history.</p>
      </div>

      {/* Search only */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="w-full pl-9 pr-28 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder="Search by name or phone..."
          />
          <button
            onClick={runSearch}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Search
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
                      No records found.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setEditRow(r)}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{fmtDate(r.call_at)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{r.name || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDrilldownId(r.customer_id) }}
                          className="text-blue-600 hover:underline font-medium"
                        >
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
                          onClick={(e) => { e.stopPropagation(); setEditRow(r) }}
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
          onPage={(p) => navigate({ search: filters.search, page: p, pageSize })}
          onPageSize={(n) => navigate({ search: filters.search, page: 1, pageSize: n })}
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
