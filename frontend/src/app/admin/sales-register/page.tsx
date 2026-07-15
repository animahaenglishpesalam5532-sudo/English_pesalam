import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import SalesRegister from '@/components/admin/SalesRegister'
import type { Aggregates } from '@/components/admin/SalesCharts'
import { getCurrentUser } from '@/lib/auth/roles'
import {
  getRegisterRows,
  getStaffOptions,
  getEntryProducts,
  type RegisterFilters,
  type RegisterRow,
  type Category,
} from '@/app/actions/sales'

export const dynamic = 'force-dynamic'

const CATEGORY_LABEL: Record<Category, string> = {
  general: 'General',
  book: 'Book',
  pdf_ppt: 'PDF & PPT',
  video_course: 'Video Course',
}

// Aggregates over purchase-only rows for the sales-focused register.
function computeAggregates(rows: RegisterRow[]): Aggregates {
  let revenue = 0
  const buyers = new Set<string>()
  const dayMap = new Map<string, { revenue: number; sales: number }>()
  const catMap = new Map<Category, { revenue: number; sales: number }>()
  const staffMap = new Map<string, { revenue: number; sales: number }>()

  for (const r of rows) {
    const amt = Number(r.amount ?? 0)
    revenue += amt
    buyers.add(r.customer_id)

    const day = r.call_at.slice(0, 10)
    const d = dayMap.get(day) ?? { revenue: 0, sales: 0 }
    d.revenue += amt
    d.sales += 1
    dayMap.set(day, d)

    const c = catMap.get(r.category) ?? { revenue: 0, sales: 0 }
    c.revenue += amt
    c.sales += 1
    catMap.set(r.category, c)

    const staff = r.staff_name || 'Unknown'
    const s = staffMap.get(staff) ?? { revenue: 0, sales: 0 }
    s.revenue += amt
    s.sales += 1
    staffMap.set(staff, s)
  }

  const byDay = Array.from(dayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({
      date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      revenue: v.revenue,
      sales: v.sales,
    }))

  const byCategory = (Object.keys(CATEGORY_LABEL) as Category[]).map((c) => ({
    category: CATEGORY_LABEL[c],
    revenue: catMap.get(c)?.revenue ?? 0,
    sales: catMap.get(c)?.sales ?? 0,
  }))

  const byStaff = Array.from(staffMap.entries()).map(([name, v]) => ({
    name,
    revenue: v.revenue,
    sales: v.sales,
  }))

  const totalSales = rows.length
  return {
    totalSales,
    revenue,
    avgOrder: totalSales > 0 ? Math.round(revenue / totalSales) : 0,
    uniqueBuyers: buyers.size,
    byDay,
    byCategory,
    byStaff,
  }
}

export default async function SalesRegisterPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin' || !user.isActive) redirect('/admin')

  // Default to last 30 days when no range specified
  const hasRange = searchParams.from || searchParams.to
  const defaultFrom = new Date()
  defaultFrom.setDate(defaultFrom.getDate() - 30)

  const filters: RegisterFilters = {
    from: searchParams.from ?? (hasRange ? '' : defaultFrom.toISOString().slice(0, 10)),
    to: searchParams.to ?? '',
    category: (searchParams.category as Category | 'all') ?? 'all',
    callType: 'purchase', // Sales Register shows completed purchases only
    staffId: searchParams.staffId ?? 'all',
    search: searchParams.search ?? '',
    sort: (searchParams.sort as RegisterFilters['sort']) ?? 'recent',
  }

  const [rows, staffOptions, products] = await Promise.all([
    getRegisterRows(filters),
    getStaffOptions(),
    getEntryProducts(),
  ])

  const aggregates = computeAggregates(rows)

  return (
    <AdminLayout role={user.role} userName={user.fullName ?? user.email}>
      <SalesRegister
        rows={rows}
        aggregates={aggregates}
        staffOptions={staffOptions}
        products={products}
        filters={filters}
      />
    </AdminLayout>
  )
}
