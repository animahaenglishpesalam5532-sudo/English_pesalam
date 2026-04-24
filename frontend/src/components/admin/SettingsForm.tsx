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
