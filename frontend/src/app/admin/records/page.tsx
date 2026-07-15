import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import RecordsView from '@/components/admin/RecordsView'
import CustomersView from '@/components/admin/CustomersView'
import { logout } from '@/app/actions/auth'
import { getCurrentUser } from '@/lib/auth/roles'
import {
  getRegisterPage,
  getStaffOptions,
  getEntryProducts,
  getCustomerSummaries,
  type RegisterFilters,
  type CustomerSummaryFilters,
  type Category,
  type CallType,
} from '@/app/actions/sales'

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
  searchParams: { [key: string]: string | undefined }
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/admin')

  if (!user.isActive) {
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

  const isAdmin = user.role === 'admin'
  const tab = searchParams.tab === 'customers' ? 'customers' : 'records'

  if (tab === 'customers') {
    const custFilters: CustomerSummaryFilters = {
      from: searchParams.from ?? '',
      to: searchParams.to ?? '',
      purchasedCategory: (searchParams.purchasedCategory as Category | 'any') ?? 'any',
      search: searchParams.search ?? '',
      sort: (searchParams.sort as CustomerSummaryFilters['sort']) ?? 'spend_desc',
      page: parsePage(searchParams.page),
      pageSize: parsePageSize(searchParams.pageSize),
    }
    const customers = await getCustomerSummaries(custFilters)
    return (
      <AdminLayout role={user.role} userName={user.fullName ?? user.email}>
        <CustomersView data={customers} filters={custFilters} />
      </AdminLayout>
    )
  }

  const filters: RegisterFilters = {
    from: searchParams.from ?? '',
    to: searchParams.to ?? '',
    category: (searchParams.category as Category | 'all') ?? 'all',
    callType: (searchParams.callType as CallType | 'all') ?? 'all',
    staffId: searchParams.staffId ?? 'all',
    search: searchParams.search ?? '',
    sort: (searchParams.sort as RegisterFilters['sort']) ?? 'recent',
    onlyLeads: searchParams.onlyLeads === '1',
    page: parsePage(searchParams.page),
    pageSize: parsePageSize(searchParams.pageSize),
  }

  const [{ rows, total }, staffOptions, products] = await Promise.all([
    getRegisterPage(filters),
    isAdmin ? getStaffOptions() : Promise.resolve([]),
    getEntryProducts(),
  ])

  return (
    <AdminLayout role={user.role} userName={user.fullName ?? user.email}>
      <RecordsView
        rows={rows}
        total={total}
        staffOptions={staffOptions}
        products={products}
        filters={filters}
        showStaffFilter={isAdmin}
      />
    </AdminLayout>
  )
}
