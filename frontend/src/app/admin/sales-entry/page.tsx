import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import SalesEntry from '@/components/admin/SalesEntry'
import { getCurrentUser } from '@/lib/auth/roles'
import AccountNotActivated from '@/components/admin/AccountNotActivated'
import { getEntryProducts } from '@/app/actions/sales'

export const dynamic = 'force-dynamic'

export default async function SalesEntryPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/admin')

  if (!user.isActive) return <AccountNotActivated email={user.email} />

  const products = await getEntryProducts()

  return (
    <AdminLayout role={user?.role} userName={user?.fullName ?? user?.email}>
      <SalesEntry products={products} />
    </AdminLayout>
  )
}
