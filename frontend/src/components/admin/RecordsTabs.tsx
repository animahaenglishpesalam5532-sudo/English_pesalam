'use client'

import Link from 'next/link'

type Tab = 'records' | 'customers' | 'analytics'

export default function RecordsTabs({ active }: { active: Tab }) {
  const cls = (t: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      active === t
        ? 'bg-blue-600 text-white'
        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
    }`
  return (
    <div className="flex gap-2 mb-6">
      <Link href="/admin/records?tab=records" className={cls('records')}>
        All Records
      </Link>
      <Link href="/admin/records?tab=customers" className={cls('customers')}>
        Top Customers
      </Link>
      <Link href="/admin/records?tab=analytics" className={cls('analytics')}>
        Analytics
      </Link>
    </div>
  )
}
