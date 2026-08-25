import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import AccountNotActivated from '@/components/admin/AccountNotActivated'
import WhatsAppMessages from '@/components/admin/whatsapp/WhatsAppMessages'
import { getCurrentUser } from '@/lib/auth/roles'
import { getTemplates } from '@/app/actions/whatsapp'
import { getCampaignOptions } from '@/app/actions/whatsappCampaigns'
import { getEntryProducts } from '@/app/actions/sales'

export const dynamic = 'force-dynamic'

export default async function WhatsAppPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/admin')

  if (!user.isActive) return <AccountNotActivated email={user.email} />

  if (user.role !== 'admin') redirect('/admin/sales-entry')

  const [{ templates, error }, campaigns, products] = await Promise.all([
    getTemplates(),
    getCampaignOptions(),
    getEntryProducts(),
  ])

  return (
    <AdminLayout role={user.role} userName={user.fullName ?? user.email}>
      <WhatsAppMessages
        templates={templates}
        templatesError={error}
        campaigns={campaigns}
        products={products}
      />
    </AdminLayout>
  )
}
