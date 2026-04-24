import { getSetting } from '@/app/actions/settings'
import AdminLayout from '@/components/admin/AdminLayout'
import SettingsForm from '@/components/admin/SettingsForm'
import BookManager from '@/components/admin/BookManager'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const logoType = await getSetting('logo_type') || 'text'
  const logoText = await getSetting('logo_text') || 'English Pesalam'
  const logoImageUrl = await getSetting('logo_image_url') || ''

  const contactEmail = await getSetting('contact_email') || ''
  const contactPhone = await getSetting('contact_phone') || ''
  
  const socialFacebook = await getSetting('social_facebook') || ''
  const socialTwitter = await getSetting('social_twitter') || ''
  const socialYoutube = await getSetting('social_youtube') || ''
  const socialInstagram = await getSetting('social_instagram') || ''

  return (
    <AdminLayout>
      <div className="max-w-4xl w-full space-y-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Global Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage site-wide configurations and branding.</p>
        </div>

        <SettingsForm 
          initialValues={{
            logo_type: logoType,
            logo_text: logoText,
            logo_image_url: logoImageUrl,
            contact_email: contactEmail,
            contact_phone: contactPhone,
            social_facebook: socialFacebook,
            social_twitter: socialTwitter,
            social_youtube: socialYoutube,
            social_instagram: socialInstagram,
          }} 
        />

        <BookManager />
      </div>
    </AdminLayout>
  )
}
