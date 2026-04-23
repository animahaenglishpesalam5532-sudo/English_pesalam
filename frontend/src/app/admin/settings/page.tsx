import { getSetting } from '@/app/actions/settings'
import AdminLayout from '@/components/admin/AdminLayout'
import SettingsForm from '@/components/admin/SettingsForm'

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

  const bookTitle1 = await getSetting('book_title_1') || ''
  const bookTitle2 = await getSetting('book_title_2') || ''
  const bookDescription = await getSetting('book_description') || ''
  const bookPrice = await getSetting('book_price') || ''
  const bookStrikethroughPrice = await getSetting('book_strikethrough_price') || ''
  const bookImageUrl = await getSetting('book_image_url') || ''
  const whatsappNumber = await getSetting('whatsapp_number') || ''
  const whatsappMessage = await getSetting('whatsapp_message') || ''

  return (
    <AdminLayout>
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
          book_title_1: bookTitle1,
          book_title_2: bookTitle2,
          book_description: bookDescription,
          book_price: bookPrice,
          book_strikethrough_price: bookStrikethroughPrice,
          book_image_url: bookImageUrl,
          whatsapp_number: whatsappNumber,
          whatsapp_message: whatsappMessage,
        }} 
      />
    </AdminLayout>
  )
}
