import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import SalesEntry from '@/components/admin/SalesEntry'
import { getCurrentUser } from '@/lib/auth/roles'
import { getEntryProducts } from '@/app/actions/sales'
import { logout } from '@/app/actions/auth'

export const dynamic = 'force-dynamic'

export default async function SalesEntryPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/admin')

  // Authenticated but no active profile yet — show a clear notice instead of
  // bouncing between routes (avoids an infinite redirect loop).
  if (!user.isActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900">Account not activated</h1>
          <p className="mt-2 text-sm text-gray-600">
            Your login works, but no access has been assigned yet. Ask an admin to
            add your account under <span className="font-medium">Team</span>, or run
            the admin seed if this is the first setup.
          </p>
          <p className="mt-3 text-xs text-gray-400">Signed in as {user.email}</p>
          <form action={logout} className="mt-6">
            <button className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              Sign out
            </button>
          </form>
        </div>
      </div>
    )
  }

  const products = await getEntryProducts()

  return (
    <AdminLayout role={user.role} userName={user.fullName ?? user.email}>
      <SalesEntry products={products} />
    </AdminLayout>
  )
}
