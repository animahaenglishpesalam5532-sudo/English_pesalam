'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users, MessageSquare } from 'lucide-react'
import CustomerDrilldown from './CustomerDrilldown'
import RecordsTabs from './RecordsTabs'
import DateField from './DateField'
import { TableSkeleton, Pagination } from './TableUI'
import type { LeadSummaryPage, LeadSummaryFilters, Category } from '@/app/actions/sales'

const CATEGORY_LABEL: Record<Category, string> = {
  general: 'General',
  book: 'Book',
  pdf_ppt: 'PDF & PPT',
  video_course: 'Video Course',
}

const CATEGORY_BADGE: Record<Category, string> = {
  general: 'bg-gray-100 text-gray-700',
  book: 'bg-emerald-100 text-emerald-800',
  pdf_ppt: 'bg-amber-100 text-amber-800',
  video_course: 'bg-purple-100 text-purple-800',
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface Props {
  data: LeadSummaryPage
  filters: LeadSummaryFilters
}

export default function LeadsView({ data, filters }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [f, setF] = useState<LeadSummaryFilters>(filters)
  const [drilldownId, setDrilldownId] = useState<string | null>(null)

  const leads = data.rows
  const page = filters.page && filters.page > 0 ? filters.page : 1
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 25

  const navigate = (next: LeadSummaryFilters) => {
    const params = new URLSearchParams()
    params.set('tab', 'leads')
    if (next.from) params.set('from', next.from)
    if (next.to) params.set('to', next.to)
    if (next.enquiredCategories && next.enquiredCategories.length) {
      params.set('enquiredCategory', next.enquiredCategories.join(','))
      if (next.match === 'all') params.set('match', 'all')
    }
    if (next.search?.trim()) params.set('search', next.search.trim())
    if (next.sort) params.set('sort', next.sort)
    if (next.page && next.page > 1) params.set('page', String(next.page))
    if (next.pageSize && next.pageSize !== 25) params.set('pageSize', String(next.pageSize))
    startTransition(() => router.push(`/admin/records?${params.toString()}`))
  }

  const applyFilters = (next: LeadSummaryFilters) => navigate({ ...next, page: 1 })

  const selectCls = 'px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <p className="mt-1 text-sm text-gray-500">Customers who only enquired and never purchased. Grouped by what they asked about.</p>
      </div>

      <RecordsTabs active="leads" />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
        <StatCard label="Leads" value={data.total} icon={Users} color="text-amber-600 bg-amber-50" />
        <StatCard label="Total Inquiries" value={data.totalInquiries} icon={MessageSquare} color="text-blue-600 bg-blue-50" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        {/* Field grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">From</label>
            <DateField className={`${selectCls} w-full cursor-pointer`} value={f.from ?? ''} onChange={(v) => setF({ ...f, from: v })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">To</label>
            <DateField className={`${selectCls} w-full cursor-pointer`} value={f.to ?? ''} onChange={(v) => setF({ ...f, to: v })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Sort</label>
            <select
              className={`${selectCls} w-full`}
              value={f.sort ?? 'recent'}
              onChange={(e) => setF({ ...f, sort: e.target.value as LeadSummaryFilters['sort'] })}
            >
              <option value="recent">Most recent inquiry</option>
              <option value="inquiries_desc">Most inquiries</option>
            </select>
          </div>
        </div>

        {/* Enquired chips */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Enquired {(f.enquiredCategories?.length ?? 0) === 0 && <span className="text-gray-400">(any)</span>}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {(['book', 'pdf_ppt', 'video_course', 'general'] as Category[]).map((c) => {
              const active = (f.enquiredCategories ?? []).includes(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    const cur = f.enquiredCategories ?? []
                    const next = active ? cur.filter((x) => x !== c) : [...cur, c]
                    setF({ ...f, enquiredCategories: next })
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
            {(f.enquiredCategories?.length ?? 0) >= 2 && (
              <div className="inline-flex rounded-full border border-gray-300 overflow-hidden text-xs ml-1">
                {(['any', 'all'] as const).map((m) => {
                  const active = (f.match ?? 'any') === m
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setF({ ...f, match: m })}
                      className={`px-3 py-1.5 font-medium transition-colors ${
                        active ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {m === 'any' ? 'Enquired any' : 'Enquired all'}
                    </button>
                  )
                })}
              </div>
            )}
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
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Leads</h3>
          <span className="text-sm text-gray-500">{data.total} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['#', 'Name', 'Phone', 'Enquired about', 'Inquiries', 'Last Inquiry'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            {isPending ? (
              <TableSkeleton cols={6} rows={pageSize > 12 ? 12 : pageSize} />
            ) : (
            <tbody className="divide-y divide-gray-100">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    No leads for the selected filters.
                  </td>
                </tr>
              ) : (
                leads.map((c, i) => (
                  <tr key={c.customer_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-400">{(page - 1) * pageSize + i + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{c.name || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button onClick={() => setDrilldownId(c.customer_id)} className="text-blue-600 hover:underline font-medium">
                        {c.phone}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {c.categories.map((cat) => (
                          <span key={cat} className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_BADGE[cat]}`}>
                            {CATEGORY_LABEL[cat]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{c.inquiryCount}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{fmtDate(c.lastInquiryAt)}</td>
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
          total={data.total}
          disabled={isPending}
          onPage={(p) => navigate({ ...filters, page: p, pageSize })}
          onPageSize={(n) => navigate({ ...filters, page: 1, pageSize: n })}
        />
      </div>

      <CustomerDrilldown customerId={drilldownId} onClose={() => setDrilldownId(null)} />
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
