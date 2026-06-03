'use client'

import React, { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { setSetting } from '@/app/actions/settings'
import { uploadImage } from '@/app/actions/blog'
import toast from 'react-hot-toast'
import { Loader2, Upload, X, Link as LinkIcon } from 'lucide-react'

const settingsSchema = Yup.object().shape({
  logo_type: Yup.string().oneOf(['text', 'image']).required('Logo type is required'),
  logo_text: Yup.string().when('logo_type', {
    is: 'text',
    then: (schema) => schema.required('Logo text is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  logo_image_url: Yup.string().when('logo_type', {
    is: 'image',
    then: (schema) => schema.required('Logo image is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  contact_email: Yup.string().nullable().test('email-or-empty', 'Invalid email address', (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)),
  contact_phone: Yup.string().nullable(),
  social_facebook: Yup.string().nullable(),
  social_twitter: Yup.string().nullable(),
  social_youtube: Yup.string().nullable(),
  social_instagram: Yup.string().nullable(),
  ppt_whatsapp_text: Yup.string().nullable(),
  pdf_whatsapp_text: Yup.string().nullable(),
  video_course_whatsapp_text: Yup.string().nullable(),
  online_class_whatsapp_text: Yup.string().nullable(),
  online_class_title: Yup.string().nullable(),
  online_class_description: Yup.string().nullable(),
  online_class_point_1: Yup.string().nullable(),
  online_class_point_2: Yup.string().nullable(),
  online_class_point_3: Yup.string().nullable(),
  online_class_point_4: Yup.string().nullable(),
  online_class_image_url: Yup.string().nullable(),
  online_class_price: Yup.string().nullable(),
  online_class_original_price: Yup.string().nullable(),
})

interface SettingsFormProps {
  initialValues: {
    logo_type: string
    logo_text: string
    logo_image_url: string
    contact_email: string
    contact_phone: string
    social_facebook: string
    social_twitter: string
    social_youtube: string
    social_instagram: string
    ppt_whatsapp_text: string
    pdf_whatsapp_text: string
    video_course_whatsapp_text: string
    online_class_whatsapp_text: string
    online_class_title: string
    online_class_description: string
    online_class_point_1: string
    online_class_point_2: string
    online_class_point_3: string
    online_class_point_4: string
    online_class_image_url: string
    online_class_price: string
    online_class_original_price: string
  }
}

export default function SettingsForm({ initialValues }: SettingsFormProps) {
  const [isUploading, setIsUploading] = useState(false)

  return (
    <div>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={settingsSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await Promise.all([
              setSetting('logo_type', values.logo_type || ''),
              setSetting('logo_text', values.logo_text || ''),
              setSetting('logo_image_url', values.logo_image_url || ''),
              setSetting('contact_email', values.contact_email || ''),
              setSetting('contact_phone', values.contact_phone || ''),
              setSetting('social_facebook', values.social_facebook || ''),
              setSetting('social_twitter', values.social_twitter || ''),
              setSetting('social_youtube', values.social_youtube || ''),
              setSetting('social_instagram', values.social_instagram || ''),
              setSetting('ppt_whatsapp_text', values.ppt_whatsapp_text || 'I want to buy '),
              setSetting('pdf_whatsapp_text', values.pdf_whatsapp_text || 'I want to buy '),
              setSetting('video_course_whatsapp_text', values.video_course_whatsapp_text || 'I want to buy '),
              setSetting('online_class_whatsapp_text', values.online_class_whatsapp_text || 'I want to join online class'),
              setSetting('online_class_title', values.online_class_title || ''),
              setSetting('online_class_description', values.online_class_description || ''),
              setSetting('online_class_point_1', values.online_class_point_1 || ''),
              setSetting('online_class_point_2', values.online_class_point_2 || ''),
              setSetting('online_class_point_3', values.online_class_point_3 || ''),
              setSetting('online_class_point_4', values.online_class_point_4 || ''),
              setSetting('online_class_image_url', values.online_class_image_url || ''),
              setSetting('online_class_price', values.online_class_price || ''),
              setSetting('online_class_original_price', values.online_class_original_price || ''),
            ])

            toast.success('Settings saved successfully!')
            window.location.reload()
          } catch (_) {
            toast.error('Failed to save settings.')
          }
          setSubmitting(false)
        }}
      >
        {({ values, setFieldValue, isSubmitting, errors, touched }) => {
          const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
            const file = e.target.files?.[0]
            if (!file) return

            if (file.size > 2 * 1024 * 1024) {
              toast.error('File size must be less than 2MB')
              e.target.value = ''
              return
            }

            setIsUploading(true)
            const formData = new FormData()
            formData.append('file', file)

            const result = await uploadImage(formData, 'settings')
            if (result.error) {
              toast.error(result.error)
            } else if (result.url) {
              setFieldValue(fieldName, result.url)
              toast.success('Image uploaded successfully')
            }
            setIsUploading(false)
          }

          return (
            <Form className="space-y-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Navigation Logo</h3>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Logo Type</label>
                  <div className="flex bg-gray-100/80 p-1.5 rounded-xl border border-gray-100 max-w-sm">
                    <button
                      type="button"
                      onClick={() => setFieldValue('logo_type', 'text')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        values.logo_type === 'text'
                          ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200/50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                      }`}
                    >
                      Gradient Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setFieldValue('logo_type', 'image')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        values.logo_type === 'image'
                          ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200/50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                      }`}
                    >
                      Image Logo
                    </button>
                  </div>
                </div>

                {values.logo_type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo Text</label>
                    <input
                      name="logo_text"
                      value={values.logo_text}
                      onChange={(e) => setFieldValue('logo_text', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        errors.logo_text && touched.logo_text ? 'border-red-300 text-red-900' : 'border-gray-300 text-gray-700'
                      }`}
                      placeholder="English Pesalam"
                    />
                  </div>
                )}

                {values.logo_type === 'image' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Logo Image</label>
                    <div className="flex items-start gap-4">
                      {values.logo_image_url ? (
                        <div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-2">
                          <img src={values.logo_image_url} alt="Logo preview" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setFieldValue('logo_image_url', '')}
                            className="absolute top-1 right-1 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors shadow-sm"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : null}
                      <div className="flex-1 space-y-3">
                        <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/60 cursor-pointer hover:border-indigo-500 hover:bg-indigo-100/60 transition-colors text-center">
                          {isUploading ? (
                            <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
                          ) : (
                            <Upload className="w-7 h-7 text-indigo-400" />
                          )}
                          <span className="text-sm text-slate-500">
                            {isUploading ? 'Uploading...' : values.logo_image_url ? 'Replace image via upload' : 'Upload logo image'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => handleImageUpload(e, 'logo_image_url')}
                          />
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LinkIcon className="w-4 h-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={values.logo_image_url}
                            onChange={e => setFieldValue('logo_image_url', e.target.value)}
                            placeholder="Or enter image URL..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Footer Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                    <input
                      name="contact_email"
                      value={values.contact_email}
                      onChange={(e) => setFieldValue('contact_email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone / WhatsApp</label>
                    <input
                      name="contact_phone"
                      value={values.contact_phone}
                      onChange={(e) => setFieldValue('contact_phone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="+91 99999 99999"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(['facebook', 'twitter', 'youtube', 'instagram'] as const).map((platform) => {
                    const fieldName = `social_${platform}` as keyof typeof values
                    const fieldError = errors[fieldName]
                    const fieldTouched = touched[fieldName]
                    return (
                      <div key={platform}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{platform} URL</label>
                        <input
                          name={fieldName}
                          value={(values[fieldName] as string) || ''}
                          onChange={(e) => setFieldValue(fieldName, e.target.value)}
                          onBlur={() => {}}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            fieldError && fieldTouched ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder={`https://${platform}.com/...`}
                        />
                        {fieldError && fieldTouched && (
                          <p className="mt-1 text-xs text-red-500">{fieldError as string}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <h3 className="font-semibold text-gray-900 border-b pb-2">PPT & PDF Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Global PPT Buying Text</label>
                    <input
                      name="ppt_whatsapp_text"
                      value={values.ppt_whatsapp_text}
                      onChange={(e) => setFieldValue('ppt_whatsapp_text', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="I want to buy "
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Global PDF Buying Text</label>
                    <input
                      name="pdf_whatsapp_text"
                      value={values.pdf_whatsapp_text}
                      onChange={(e) => setFieldValue('pdf_whatsapp_text', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="I want to buy "
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Global Video Buying Text</label>
                    <input
                      name="video_course_whatsapp_text"
                      value={values.video_course_whatsapp_text}
                      onChange={(e) => setFieldValue('video_course_whatsapp_text', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="I want to buy "
                    />
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">The product name will be appended automatically. Example: "I want to buy [Product Name]"</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Online Class Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Online Class Title</label>
                    <input
                      name="online_class_title"
                      value={values.online_class_title}
                      onChange={(e) => setFieldValue('online_class_title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="1 Month Spoken English Online Course"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Join Online Class WhatsApp Text</label>
                    <input
                      name="online_class_whatsapp_text"
                      value={values.online_class_whatsapp_text}
                      onChange={(e) => setFieldValue('online_class_whatsapp_text', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="I want to join online class"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (e.g., ₹999)</label>
                    <input
                      name="online_class_price"
                      value={values.online_class_price}
                      onChange={(e) => setFieldValue('online_class_price', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                      placeholder="₹999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (Strike-through, e.g., ₹1999)</label>
                    <input
                      name="online_class_original_price"
                      value={values.online_class_original_price}
                      onChange={(e) => setFieldValue('online_class_original_price', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                      placeholder="₹1999"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Online Class Description</label>
                  <textarea
                    name="online_class_description"
                    value={values.online_class_description}
                    onChange={(e) => setFieldValue('online_class_description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                    placeholder="Enter Tamil & English description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Point 1</label>
                    <input
                      name="online_class_point_1"
                      value={values.online_class_point_1}
                      onChange={(e) => setFieldValue('online_class_point_1', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                      placeholder="1 Month Training"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Point 2</label>
                    <input
                      name="online_class_point_2"
                      value={values.online_class_point_2}
                      onChange={(e) => setFieldValue('online_class_point_2', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                      placeholder="Free PDF Materials"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Point 3</label>
                    <input
                      name="online_class_point_3"
                      value={values.online_class_point_3}
                      onChange={(e) => setFieldValue('online_class_point_3', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                      placeholder="குறைந்த மாணவர்கள் மட்டும்"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Point 4</label>
                    <input
                      name="online_class_point_4"
                      value={values.online_class_point_4}
                      onChange={(e) => setFieldValue('online_class_point_4', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                      placeholder="Direct WhatsApp Support"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Online Class Image (Right Side)</label>
                  <div className="flex items-start gap-4">
                    {values.online_class_image_url ? (
                      <div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-2">
                        <img src={values.online_class_image_url} alt="Online Class visual preview" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setFieldValue('online_class_image_url', '')}
                          className="absolute top-1 right-1 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : null}
                    <div className="flex-1 space-y-3">
                      <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/60 cursor-pointer hover:border-indigo-500 hover:bg-indigo-100/60 transition-colors text-center">
                        {isUploading ? (
                          <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
                        ) : (
                          <Upload className="w-7 h-7 text-indigo-400" />
                        )}
                        <span className="text-sm text-slate-500">
                          {isUploading ? 'Uploading...' : values.online_class_image_url ? 'Replace image via upload' : 'Upload section image'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploading}
                          onChange={(e) => handleImageUpload(e, 'online_class_image_url')}
                        />
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LinkIcon className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={values.online_class_image_url}
                          onChange={e => setFieldValue('online_class_image_url', e.target.value)}
                          placeholder="Or enter image URL..."
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
}
