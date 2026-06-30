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
  const pptWhatsappText = await getSetting('ppt_whatsapp_text') || 'I want to buy '
  const pdfWhatsappText = await getSetting('pdf_whatsapp_text') || 'I want to buy '
  const videoCourseWhatsappText = await getSetting('video_course_whatsapp_text') || 'I want to buy '
  const pptPdfWhatsappNumber = await getSetting('ppt_pdf_whatsapp_number') || ''
  const onlineClassWhatsappText = await getSetting('online_class_whatsapp_text') || 'I want to join online class'
  const onlineClassWhatsappNumber = await getSetting('online_class_whatsapp_number') || ''

  const onlineClassTitle = await getSetting('online_class_title') || '1 Month Spoken English Online Course'
  const onlineClassDescription = await getSetting('online_class_description') || 'ஆங்கிலத்தில் பேச ஆரம்பிக்க இந்த 1 Month Spoken English Online Course உங்களுக்கு மிகவும் உதவியாக இருக்கும். இந்த ஒரு மாதத்தில் கற்றுக்கொடுக்கும் அனைத்து lessons-க்கும் PDF materials இலவசமாக வழங்கப்படும்.'
  const onlineClassPoint1 = await getSetting('online_class_point_1') || '1 Month Training'
  const onlineClassPoint2 = await getSetting('online_class_point_2') || 'Free PDF Materials'
  const onlineClassPoint3 = await getSetting('online_class_point_3') || 'குறைந்த மாணவர்கள் மட்டும்'
  const onlineClassPoint4 = await getSetting('online_class_point_4') || 'Direct WhatsApp Support'
  const onlineClassImageUrl = await getSetting('online_class_image_url') || ''
  const onlineClassPrice = await getSetting('online_class_price') || '₹999'
  const onlineClassOriginalPrice = await getSetting('online_class_original_price') || '₹1999'
  const onlineClassButtonText = await getSetting('online_class_button_text') || 'WhatsApp-ல் Course Details வாங்குங்கள்'

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
            ppt_whatsapp_text: pptWhatsappText,
            pdf_whatsapp_text: pdfWhatsappText,
            video_course_whatsapp_text: videoCourseWhatsappText,
            ppt_pdf_whatsapp_number: pptPdfWhatsappNumber,
            online_class_whatsapp_text: onlineClassWhatsappText,
            online_class_whatsapp_number: onlineClassWhatsappNumber,
            online_class_title: onlineClassTitle,
            online_class_description: onlineClassDescription,
            online_class_point_1: onlineClassPoint1,
            online_class_point_2: onlineClassPoint2,
            online_class_point_3: onlineClassPoint3,
            online_class_point_4: onlineClassPoint4,
            online_class_image_url: onlineClassImageUrl,
            online_class_price: onlineClassPrice,
            online_class_original_price: onlineClassOriginalPrice,
            online_class_button_text: onlineClassButtonText,
          }} 
        />

        <BookManager />
      </div>
    </AdminLayout>
  )
}
