import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import RecordsView from '@/components/admin/RecordsView'
import CustomersView from '@/components/admin/CustomersView'
import LeadsView from '@/components/admin/LeadsView'
import AnalyticsView from '@/components/admin/AnalyticsView'
import { logout } from '@/app/actions/auth'
import { getCurrentUser } from '@/lib/auth/roles'
import {
  getRegisterPage,
  getStaffOptions,
  getEntryProducts,
  getCustomerSummaries,
  getLeadSummaries,
  type RegisterFilters,
  type CustomerSummaryFilters,
  type LeadSummaryFilters,
  type Category,
  type CallType,
} from '@/app/actions/sales'
import { getSalesAnalytics, type SalesAnalyticsFilters } from '@/app/actions/sales-analytics'

const DEFAULT_PAGE_SIZE = 25

function parsePage(v?: string) {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1
}
function parsePageSize(v?: string) {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_PAGE_SIZE
}

export const dynamic = 'force-dynamic'

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const sp = await searchParams
  const user = await getCurrentUser()
  if (!user) redirect('/admin')

  if (!user?.isActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="max-w-sm rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold text-gray-900">Account not activated</h1>
          <p className="mt-2 text-sm text-gray-500">
            Your account isn&apos;t active yet. Please contact your administrator.
          </p>
          <form action={logout} className="mt-5">
            <button className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800">
              Sign out
            </button>
          </form>
        </div>
      </div>
    )
  }

  const isAdmin = user?.role === 'admin'
  const tab =
    sp?.tab === 'customers'
      ? 'customers'
      : sp?.tab === 'leads'
        ? 'leads'
        : sp?.tab === 'analytics'
          ? 'analytics'
          : 'records'

  if (tab === 'analytics') {
    const validCategories: Category[] = ['general', 'book', 'pdf_ppt', 'video_course']
    const analyticsCategories = (sp?.category ?? '')
      .split(',')
      .map((c) => c?.trim())
      .filter((c): c is Category => (validCategories as string[]).includes(c))
    const analyticsFilters: SalesAnalyticsFilters = {
      from: sp?.from ?? '',
      to: sp?.to ?? '',
      categories: analyticsCategories,
    }
    const analytics = await getSalesAnalytics(analyticsFilters)
    return (
      <AdminLayout role={user?.role} userName={user?.fullName ?? user?.email}>
        <AnalyticsView data={analytics} filters={analyticsFilters} />
      </AdminLayout>
    )
  }

  if (tab === 'customers') {
    const validCategories: Category[] = ['general', 'book', 'pdf_ppt', 'video_course']
    const purchasedCategories = (sp?.purchasedCategory ?? '')
      .split(',')
      .map((c) => c?.trim())
      .filter((c): c is Category => (validCategories as string[]).includes(c))
    const custFilters: CustomerSummaryFilters = {
      from: sp?.from ?? '',
      to: sp?.to ?? '',
      purchasedCategories,
      purchaseMatch: sp?.purchaseMatch === 'all' ? 'all' : 'any',
      search: sp?.search ?? '',
      sort: (sp?.sort as CustomerSummaryFilters['sort']) ?? 'spend_desc',
      page: parsePage(sp?.page),
      pageSize: parsePageSize(sp?.pageSize),
    }
    const customers = await getCustomerSummaries(custFilters)
    return (
      <AdminLayout role={user?.role} userName={user?.fullName ?? user?.email}>
        <CustomersView data={customers} filters={custFilters} />
      </AdminLayout>
    )
  }

  if (tab === 'leads') {
    const validCategories: Category[] = ['general', 'book', 'pdf_ppt', 'video_course']
    const enquiredCategories = (sp?.enquiredCategory ?? '')
      .split(',')
      .map((c) => c?.trim())
      .filter((c): c is Category => (validCategories as string[]).includes(c))
    const leadFilters: LeadSummaryFilters = {
      from: sp?.from ?? '',
      to: sp?.to ?? '',
      enquiredCategories,
      match: sp?.match === 'all' ? 'all' : 'any',
      search: sp?.search ?? '',
      sort: (sp?.sort as LeadSummaryFilters['sort']) ?? 'recent',
      page: parsePage(sp?.page),
      pageSize: parsePageSize(sp?.pageSize),
    }
    const leads = await getLeadSummaries(leadFilters)
    return (
      <AdminLayout role={user?.role} userName={user?.fullName ?? user?.email}>
        <LeadsView data={leads} filters={leadFilters} />
      </AdminLayout>
    )
  }

  const filters: RegisterFilters = {
    from: sp?.from ?? '',
    to: sp?.to ?? '',
    category: (sp?.category as Category | 'all') ?? 'all',
    callType: (sp?.callType as CallType | 'all') ?? 'all',
    staffId: sp?.staffId ?? 'all',
    search: sp?.search ?? '',
    sort: (sp?.sort as RegisterFilters['sort']) ?? 'recent',
    onlyLeads: sp?.onlyLeads === '1',
    page: parsePage(sp?.page),
    pageSize: parsePageSize(sp?.pageSize),
  }

  const [{ rows, total }, staffOptions, products] = await Promise.all([
    getRegisterPage(filters),
    isAdmin ? getStaffOptions() : Promise.resolve([]),
    getEntryProducts(),
  ])

  return (
    <AdminLayout role={user?.role} userName={user?.fullName ?? user?.email}>
      <RecordsView
        rows={rows}
        total={total}
        staffOptions={staffOptions}
        products={products}
        filters={filters}
        showStaffFilter={isAdmin}
        canDelete={isAdmin}
      />
    </AdminLayout>
  )
}
