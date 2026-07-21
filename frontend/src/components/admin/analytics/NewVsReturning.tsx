'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import type { NewVsReturningData } from '@/app/actions/sales-analytics'

const fmtMoney = (n: number) => `₹${Number(n ?? 0).toLocaleString('en-IN')}`

export default function NewVsReturning({ data }: { data: NewVsReturningData }) {
  const newBuyers = data?.newBuyers ?? 0
  const returningBuyers = data?.returningBuyers ?? 0
  const repeatRate = data?.repeatRate ?? 0
  const byMonth = data?.byMonth ?? []

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">New vs returning customers</h3>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Metric label="New buyers" value={newBuyers.toLocaleString('en-IN')} sub={fmtMoney(data?.newRevenue ?? 0)} tone="text-blue-600" />
        <Metric label="Returning buyers" value={returningBuyers.toLocaleString('en-IN')} sub={fmtMoney(data?.returningRevenue ?? 0)} tone="text-emerald-600" />
        <Metric label="Repeat rate" value={`${repeatRate}%`} sub="of buyers" tone="text-purple-600" />
      </div>

      <div className="h-56">
        {byMonth.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byMonth} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="newBuyers" stackId="b" name="New" fill="#3b82f6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="returningBuyers" stackId="b" name="Returning" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">No buyers in range.</div>
        )}
      </div>
    </div>
  )
}

function Metric({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
      <p className={`text-2xl font-bold ${tone} leading-none`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  )
}
