import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import BookTracking from '@/components/admin/book-tracking/BookTracking'
import { getCurrentUser } from '@/lib/auth/roles'
import AccountNotActivated from '@/components/admin/AccountNotActivated'
import { getBookOptions } from '@/app/actions/bookTracking'

export const dynamic = 'force-dynamic'

export default async function BookTrackingPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/admin')

  if (!user.isActive) return <AccountNotActivated email={user.email} />

  if (user.role !== 'admin' && user.role !== 'delivery' && user.role !== 'staff') redirect('/admin/sales-entry')

  const books = await getBookOptions()

  const canWrite = user.role === 'admin' || user.role === 'delivery'

  return (
    <AdminLayout role={user.role} userName={user.fullName ?? user.email}>
      <BookTracking books={books} canDelete={canWrite} canWrite={canWrite} />
    </AdminLayout>
  )
}
