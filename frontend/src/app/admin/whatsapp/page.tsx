import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import AccountNotActivated from '@/components/admin/AccountNotActivated'
import WhatsAppMessages from '@/components/admin/whatsapp/WhatsAppMessages'
import { getCurrentUser } from '@/lib/auth/roles'
import { getTemplates } from '@/app/actions/whatsapp'

export const dynamic = 'force-dynamic'

export default async function WhatsAppPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/admin')

  if (!user.isActive) return <AccountNotActivated email={user.email} />

  if (user.role !== 'admin') redirect('/admin/sales-entry')

  const { templates, error } = await getTemplates()

  return (
    <AdminLayout role={user.role} userName={user.fullName ?? user.email}>
      <WhatsAppMessages templates={templates} templatesError={error} />
    </AdminLayout>
  )
}
