import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import AccountNotActivated from '@/components/admin/AccountNotActivated'
import CampaignsBoard from '@/components/admin/whatsapp/campaigns/CampaignsBoard'
import { getCurrentUser } from '@/lib/auth/roles'

export const dynamic = 'force-dynamic'

export default async function CampaignsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/admin')

  if (!user.isActive) return <AccountNotActivated email={user.email} />

  if (user.role !== 'admin') redirect('/admin/sales-entry')

  return (
    <AdminLayout role={user.role} userName={user.fullName ?? user.email}>
      <CampaignsBoard />
    </AdminLayout>
  )
}
