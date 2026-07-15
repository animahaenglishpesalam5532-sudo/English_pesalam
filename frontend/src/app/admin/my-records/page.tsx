import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import StaffRecords from '@/components/admin/StaffRecords'
import { logout } from '@/app/actions/auth'
import { getCurrentUser } from '@/lib/auth/roles'
import { getRegisterPage, getEntryProducts, type RegisterFilters } from '@/app/actions/sales'

export const dynamic = 'force-dynamic'

const DEFAULT_PAGE_SIZE = 25

function parsePage(v?: string) {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1
}
function parsePageSize(v?: string) {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_PAGE_SIZE
}

export default async function MyRecordsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/admin')

  // Admins use the full register at /admin/records.
  if (user.role === 'admin') redirect('/admin/records')

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

  const filters: RegisterFilters = {
    search: searchParams.search ?? '',
    sort: 'recent',
    page: parsePage(searchParams.page),
    pageSize: parsePageSize(searchParams.pageSize),
  }

  const [{ rows, total }, products] = await Promise.all([
    getRegisterPage(filters),
    getEntryProducts(),
  ])

  return (
    <AdminLayout role={user.role} userName={user.fullName ?? user.email}>
      <StaffRecords rows={rows} total={total} products={products} filters={filters} />
    </AdminLayout>
  )
}
