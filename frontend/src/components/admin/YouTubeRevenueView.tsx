'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import toast from 'react-hot-toast'
import { SquarePlay, Trash2, TrendingUp, CalendarDays, Wallet } from 'lucide-react'
import DateField from '@/components/admin/DateField'
import { Modal } from '@/components/ui/Modal'
import {
  addYoutubeRevenue,
  deleteYoutubeRevenue,
  type YoutubeRevenueData,
  type YoutubeRevenueFilters,
} from '@/app/actions/youtube-revenue'

const rupee = (v: unknown) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`

function ymd(d: Date) {
  return d.toISOString().slice(0, 10)
}

function StatCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string
  value: string
  icon: React.ElementType
  tone: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center">
      <div className={`p-3 rounded-full mr-4 ${tone}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

export default function YouTubeRevenueView({
  data,
  filters,
}: {
  data: YoutubeRevenueData
  filters: YoutubeRevenueFilters
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Add form
  const [earnedOn, setEarnedOn] = useState('')
  const [revenue, setRevenue] = useState('')
  const [saving, setSaving] = useState(false)

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Filter range (local, applied to URL)
  const [from, setFrom] = useState(filters.from ?? '')
  const [to, setTo] = useState(filters.to ?? '')

  function applyRange(nextFrom: string, nextTo: string) {
    const params = new URLSearchParams()
    if (nextFrom) params.set('from', nextFrom)
    if (nextTo) params.set('to', nextTo)
    startTransition(() => router.push(`/admin/youtube-revenue?${params.toString()}`))
  }

  function quickRange(days: number) {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - (days - 1))
    const f = ymd(start)
    const t = ymd(end)
    setFrom(f)
    setTo(t)
    applyRange(f, t)
  }

  function clearRange() {
    setFrom('')
    setTo('')
    startTransition(() => router.push('/admin/youtube-revenue'))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!earnedOn) {
      toast.error('Please pick a date')
      return
    }
    const amount = Number(revenue)
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error('Enter a valid revenue amount')
      return
    }
    setSaving(true)
    const res = await addYoutubeRevenue({ earnedOn, revenue: amount })
    setSaving(false)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success('Revenue added')
    setEarnedOn('')
    setRevenue('')
    startTransition(() => router.refresh())
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const res = await deleteYoutubeRevenue(deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success('Entry deleted')
    startTransition(() => router.refresh())
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-red-50 text-red-600">
          <SquarePlay className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">YouTube Revenue</h1>
          <p className="mt-0.5 text-sm text-gray-500">Track daily YouTube earnings over time.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Last 7 days" value={rupee(data.last7)} icon={CalendarDays} tone="bg-blue-50 text-blue-600" />
        <StatCard title="Last 30 days" value={rupee(data.last30)} icon={TrendingUp} tone="bg-emerald-50 text-emerald-600" />
        <StatCard title="Total in range" value={rupee(data.totalInRange)} icon={Wallet} tone="bg-indigo-50 text-indigo-600" />
        <StatCard title="All time" value={rupee(data.allTime)} icon={SquarePlay} tone="bg-red-50 text-red-600" />
      </div>

      {/* Add entry */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Add daily revenue</h3>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
            <DateField
              value={earnedOn}
              onChange={setEarnedOn}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Select date"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Revenue (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex justify-center items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Add revenue'}
          </button>
        </form>
      </div>

      {/* Filter range */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <DateField
              value={from}
              onChange={(v) => { setFrom(v); applyRange(v, to) }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Start date"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <DateField
              value={to}
              onChange={(v) => { setTo(v); applyRange(from, v) }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="End date"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => quickRange(7)} className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">Last 7 days</button>
            <button onClick={() => quickRange(30)} className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">Last 30 days</button>
            <button onClick={() => quickRange(90)} className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">Last 90 days</button>
            <button onClick={clearRange} className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">All time</button>
          </div>
        </div>
      </div>

      {/* Revenue over time */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue over time (₹)</h3>
        <div className="h-72">
          {data.byDay.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">
              No revenue recorded for this range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.byDay} margin={{ top: 5, right: 10, left: -5, bottom: 0 }}>
                <defs>
                  <linearGradient id="ytRevFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => rupee(v)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#ytRevFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Entries table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Entries</h3>
          <span className="text-sm text-gray-500">{data.rows.length} record{data.rows.length === 1 ? '' : 's'}</span>
        </div>
        {data.rows.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">No entries yet. Add your first daily revenue above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(r.earned_on).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{rupee(r.revenue)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDeleteId(r.id)}
                        className="inline-flex items-center text-red-600 hover:text-red-700 transition-colors"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isPending && <div className="fixed bottom-4 right-4 text-xs text-gray-400">Updating…</div>}

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete entry">
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete this revenue entry? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteId(null)}
            className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
