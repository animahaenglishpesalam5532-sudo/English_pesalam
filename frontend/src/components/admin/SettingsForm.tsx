'use client'

import React, { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { setSetting } from '@/app/actions/settings'
import { uploadImage } from '@/app/actions/blog'
import toast from 'react-hot-toast'
import { Loader2, Upload, X } from 'lucide-react'

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
  book_title_1: Yup.string().nullable(),
  book_title_2: Yup.string().nullable(),
  book_description: Yup.string().nullable(),
  book_price: Yup.string().nullable(),
  book_strikethrough_price: Yup.string().nullable(),
  book_image_url: Yup.string().nullable(),
  whatsapp_number: Yup.string().nullable(),
  whatsapp_message: Yup.string().nullable(),
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
    book_title_1: string
    book_title_2: string
    book_description: string
    book_price: string
    book_strikethrough_price: string
    book_image_url: string
    whatsapp_number: string
    whatsapp_message: string
  }
}

export default function SettingsForm({ initialValues }: SettingsFormProps) {
  const [isUploading, setIsUploading] = useState(false)

  return (
    <div className="max-w-4xl w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Global Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage site-wide configurations and branding.</p>
      </div>

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
              setSetting('book_title_1', values.book_title_1 || ''),
              setSetting('book_title_2', values.book_title_2 || ''),
              setSetting('book_description', values.book_description || ''),
              setSetting('book_price', values.book_price || ''),
              setSetting('book_strikethrough_price', values.book_strikethrough_price || ''),
              setSetting('book_image_url', values.book_image_url || ''),
              setSetting('whatsapp_number', values.whatsapp_number || ''),
              setSetting('whatsapp_message', values.whatsapp_message || ''),
            ])
            
            toast.success('Settings saved successfully!')
            window.location.reload()
          } catch (error) {
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

            const result = await uploadImage(formData)
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
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload Logo Image</label>
                    
                    {values.logo_image_url ? (
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 group w-64 h-auto bg-gray-50 p-4">
                        <img src={values.logo_image_url} alt="Logo preview" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setFieldValue('logo_image_url', '')}
                          className="absolute top-2 right-2 p-1.5 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors shadow-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors w-64 h-32">
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 text-blue-500 animate-spin mb-2" />
                        ) : (
                          <Upload className="w-6 h-6 text-gray-400 mb-2" />
                        )}
                        <div className="text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 outline-none hover:text-blue-500 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Upload a file</span>
                            <input type="file" className="sr-only" onChange={(e) => handleImageUpload(e, 'logo_image_url')} accept="image/*" disabled={isUploading} />
                          </label>
                        </div>
                      </div>
                    )}
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

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                  <h2 className="text-lg font-bold text-slate-800">Home Page Book Details</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Title Line 1</label>
                      <Field name="book_title_1" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Title Line 2</label>
                      <Field name="book_title_2" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    <Field as="textarea" rows={3} name="book_description" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Current Price</label>
                      <Field name="book_price" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Original Price</label>
                      <Field name="book_strikethrough_price" className="w-full px-4 py-2.5 rounded-xl border border-slate-200" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Book Cover Image</label>
                    <div className="flex items-start gap-6">
                      {values.book_image_url && (
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                          <img src={values.book_image_url} className="w-full h-full object-contain" alt="Book" />
                        </div>
                      )}
                      <div className="flex-1">
                        <label htmlFor="book-image-upload" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-dashed cursor-pointer">
                          <Upload className="w-5 h-5" />
                          {isUploading ? 'Uploading...' : 'Upload Book Cover'}
                          <input type="file" id="book-image-upload" className="hidden" onChange={(e) => handleImageUpload(e, 'book_image_url')} accept="image/*" />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">WhatsApp Buy Button</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp Number</label>
                        <p className="text-xs text-slate-400 mb-2">Include country code without + or spaces (e.g. 919345639627)</p>
                        <Field
                          name="whatsapp_number"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                          placeholder="919345639627"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp Message</label>
                        <p className="text-xs text-slate-400 mb-2">Pre-filled message sent when user clicks Buy Now</p>
                        <Field
                          as="textarea"
                          rows={3}
                          name="whatsapp_message"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                          placeholder="I want to buy the English Pesalam book"
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
