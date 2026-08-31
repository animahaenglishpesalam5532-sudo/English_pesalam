import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import AccountNotActivated from '@/components/admin/AccountNotActivated'
import AutoReplySettings from '@/components/admin/whatsapp/settings/AutoReplySettings'
import { getCurrentUser } from '@/lib/auth/roles'
import { getAutoReplySettings } from '@/app/actions/whatsappSettings'

export const dynamic = 'force-dynamic'

export default async function WhatsAppSettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/admin')

  if (!user.isActive) return <AccountNotActivated email={user.email} />

  if (user.role !== 'admin') redirect('/admin/sales-entry')

  const settings = await getAutoReplySettings()

  return (
    <AdminLayout role={user.role} userName={user.fullName ?? user.email}>
      <AutoReplySettings initial={settings} />
    </AdminLayout>
  )
}
