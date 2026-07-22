'use client'

import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts'

export interface Aggregates {
  totalSales: number
  revenue: number
  avgOrder: number
  uniqueBuyers: number
  byDay: { date: string; revenue: number; sales: number }[]
  byCategory: { category: string; revenue: number; sales: number }[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#ef4444']

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  )
}

const rupee = (v: unknown) => `₹${Number(v ?? 0).toLocaleString('en-IN')}`

export default function SalesCharts({ data }: { data: Aggregates }) {
  // Running total of revenue across the range, day by day.
  let running = 0
  const cumulative = data.byDay.map((d) => {
    running += d.revenue
    return { date: d.date, total: running }
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card title="Revenue over time (₹)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.byDay} margin={{ top: 5, right: 10, left: -5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => rupee(v)} />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} name="Revenue" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Sales count over time">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.byDay} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="sales" name="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Revenue by category (₹)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.byCategory} margin={{ top: 5, right: 10, left: -5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="category" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => rupee(v)} />
            <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
              {data.byCategory.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Cumulative revenue (₹)">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cumulative} margin={{ top: 5, right: 10, left: -5, bottom: 0 }}>
            <defs>
              <linearGradient id="cumRevFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => rupee(v)} />
            <Area
              type="monotone"
              dataKey="total"
              name="Cumulative revenue"
              stroke="#a855f7"
              strokeWidth={2}
              fill="url(#cumRevFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
