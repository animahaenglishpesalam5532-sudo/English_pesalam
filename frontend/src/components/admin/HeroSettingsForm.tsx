'use client'

import React, { useState } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { setSetting } from '@/app/actions/settings'
import { uploadImage } from '@/app/actions/blog'
import toast from 'react-hot-toast'
import { Loader2, Upload, X, Link as LinkIcon } from 'lucide-react'

const heroSettingsSchema = Yup.object().shape({
  hero_subtitle: Yup.string().nullable(),
  hero_title: Yup.string().nullable(),
  hero_description: Yup.string().nullable(),
  trainer_name: Yup.string().nullable(),
  trainer_title: Yup.string().nullable(),
  trainer_image_url: Yup.string().nullable(),
  trainer_stat_1_value: Yup.string().nullable(),
  trainer_stat_1_label: Yup.string().nullable(),
  trainer_stat_2_value: Yup.string().nullable(),
  trainer_stat_2_label: Yup.string().nullable(),
})

interface HeroSettingsFormProps {
  initialValues: {
    hero_subtitle: string
    hero_title: string
    hero_description: string
    trainer_name: string
    trainer_title: string
    trainer_image_url: string
    trainer_stat_1_value: string
    trainer_stat_1_label: string
    trainer_stat_2_value: string
    trainer_stat_2_label: string
  }
}

export default function HeroSettingsForm({ initialValues }: HeroSettingsFormProps) {
  const [isUploading, setIsUploading] = useState(false)

  return (
    <div>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={heroSettingsSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await Promise.all([
              setSetting('hero_subtitle', values.hero_subtitle || ''),
              setSetting('hero_title', values.hero_title || ''),
              setSetting('hero_description', values.hero_description || ''),
              setSetting('trainer_name', values.trainer_name || ''),
              setSetting('trainer_title', values.trainer_title || ''),
              setSetting('trainer_image_url', values.trainer_image_url || ''),
              setSetting('trainer_stat_1_value', values.trainer_stat_1_value || ''),
              setSetting('trainer_stat_1_label', values.trainer_stat_1_label || ''),
              setSetting('trainer_stat_2_value', values.trainer_stat_2_value || ''),
              setSetting('trainer_stat_2_label', values.trainer_stat_2_label || ''),
            ])

            toast.success('Hero Section settings saved successfully!')
            window.location.reload()
          } catch (_) {
            toast.error('Failed to save Hero settings.')
          }
          setSubmitting(false)
        }}
      >
        {({ values, setFieldValue, isSubmitting }) => {
          const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
            const file = e.target.files?.[0]
            if (!file) return

            setIsUploading(true)
            const toastId = toast.loading('Uploading photo...')

            try {
              const formData = new FormData()
              formData.append('file', file)
              const result = await uploadImage(formData, 'settings')
              
              if (result.error) {
                toast.error(result.error, { id: toastId })
              } else if (result.url) {
                setFieldValue(fieldName, result.url)
                toast.success('Photo uploaded successfully!', { id: toastId })
              }
            } catch (_) {
              toast.error('Failed to upload photo.', { id: toastId })
            } finally {
              setIsUploading(false)
            }
          }

          return (
            <Form className="space-y-8 max-w-4xl">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Hero Section Content</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hero Tagline / Subtitle</label>
                    <input
                      name="hero_subtitle"
                      value={values.hero_subtitle}
                      onChange={(e) => setFieldValue('hero_subtitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700 font-sans"
                      placeholder="1M+ YOUTUBE FAMILY • TAMIL TO ENGLISH FOCUS"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                    <input
                      name="hero_title"
                      value={values.hero_title}
                      onChange={(e) => setFieldValue('hero_title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700 font-sans"
                      placeholder="தமிழ் பேசும் மக்களுக்கான Practical Spoken English Platform"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hero Description</label>
                    <textarea
                      name="hero_description"
                      value={values.hero_description}
                      onChange={(e) => setFieldValue('hero_description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700 font-sans"
                      placeholder="English தெரிந்தும் பேச முடியாமல் தவிக்கிறீர்களா? Simple Tamil explanation..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Trainer Profile Card</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trainer Name</label>
                    <input
                      name="trainer_name"
                      value={values.trainer_name}
                      onChange={(e) => setFieldValue('trainer_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700 font-sans"
                      placeholder="Maha JC"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trainer Designation / Title</label>
                    <input
                      name="trainer_title"
                      value={values.trainer_title}
                      onChange={(e) => setFieldValue('trainer_title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700 font-sans"
                      placeholder="Founder & Spoken English Trainer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stat 1 Value</label>
                        <input
                          name="trainer_stat_1_value"
                          value={values.trainer_stat_1_value}
                          onChange={(e) => setFieldValue('trainer_stat_1_value', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700 font-sans"
                          placeholder="1M+"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stat 1 Label</label>
                        <input
                          name="trainer_stat_1_label"
                          value={values.trainer_stat_1_label}
                          onChange={(e) => setFieldValue('trainer_stat_1_label', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700 font-sans"
                          placeholder="Subscribers"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stat 2 Value</label>
                        <input
                          name="trainer_stat_2_value"
                          value={values.trainer_stat_2_value}
                          onChange={(e) => setFieldValue('trainer_stat_2_value', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700 font-sans"
                          placeholder="500+"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stat 2 Label</label>
                        <input
                          name="trainer_stat_2_label"
                          value={values.trainer_stat_2_label}
                          onChange={(e) => setFieldValue('trainer_stat_2_label', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700 font-sans"
                          placeholder="Lessons"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Trainer Photo</label>
                    <div className="flex items-start gap-4">
                      {values.trainer_image_url ? (
                        <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-2">
                          <img src={values.trainer_image_url} alt="Trainer photo preview" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setFieldValue('trainer_image_url', '')}
                            className="absolute top-1 right-1 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors shadow-sm"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : null}
                      
                      <div className="flex-1 space-y-3">
                        <label className="flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/60 cursor-pointer hover:border-indigo-500 hover:bg-indigo-100/60 transition-colors text-center">
                          {isUploading ? (
                            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                          ) : (
                            <Upload className="w-6 h-6 text-indigo-400" />
                          )}
                          <span className="text-xs text-slate-500 font-medium">
                            {isUploading ? 'Uploading...' : values.trainer_image_url ? 'Replace photo' : 'Upload trainer photo'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => handleImageUpload(e, 'trainer_image_url')}
                          />
                        </label>
                        
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={values.trainer_image_url}
                            onChange={e => setFieldValue('trainer_image_url', e.target.value)}
                            placeholder="Or enter image URL..."
                            className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-xs text-gray-700 font-sans"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-bold">
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
