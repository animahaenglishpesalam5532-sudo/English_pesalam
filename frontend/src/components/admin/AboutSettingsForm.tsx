'use client'

import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { setSetting } from '@/app/actions/settings'
import toast from 'react-hot-toast'
import { Loader2, AlertCircle } from 'lucide-react'

// Validation schema verifying that the JSON arrays are properly formatted arrays
const aboutSettingsSchema = Yup.object().shape({
  about_tagline: Yup.string().nullable().required('Tagline is required'),
  about_title: Yup.string().nullable().required('Title is required'),
  about_description_1: Yup.string().nullable(),
  about_description_2: Yup.string().nullable(),
  about_description_3: Yup.string().nullable(),
  about_description_4: Yup.string().nullable(),
  about_trainer_name: Yup.string().nullable().required('Trainer name is required'),
  about_trainer_title: Yup.string().nullable().required('Trainer title is required'),
  about_trainer_bio_1: Yup.string().nullable(),
  about_trainer_bio_2: Yup.string().nullable(),
  about_trainer_bio_3: Yup.string().nullable(),
  about_vision_statement: Yup.string().nullable(),
  about_vision_desc_1: Yup.string().nullable(),
  about_vision_desc_2: Yup.string().nullable(),
  about_vision_desc_3: Yup.string().nullable(),
  
  about_what_we_teach: Yup.string().required('What We Teach is required').test('is-json', 'Must be a valid JSON array', (val) => {
    try {
      const parsed = JSON.parse(val || '[]');
      return Array.isArray(parsed);
    } catch {
      return false;
    }
  }),
  about_why_english_pesalam: Yup.string().required('Why English Pesalam is required').test('is-json', 'Must be a valid JSON array', (val) => {
    try {
      const parsed = JSON.parse(val || '[]');
      return Array.isArray(parsed);
    } catch {
      return false;
    }
  }),
  about_what_you_will_get: Yup.string().required('What You Will Get is required').test('is-json', 'Must be a valid JSON array of strings', (val) => {
    try {
      const parsed = JSON.parse(val || '[]');
      return Array.isArray(parsed);
    } catch {
      return false;
    }
  }),
  about_our_impact: Yup.string().required('Our Impact is required').test('is-json', 'Must be a valid JSON array', (val) => {
    try {
      const parsed = JSON.parse(val || '[]');
      return Array.isArray(parsed);
    } catch {
      return false;
    }
  }),
})

interface AboutSettingsFormProps {
  initialValues: {
    about_tagline: string
    about_title: string
    about_description_1: string
    about_description_2: string
    about_description_3: string
    about_description_4: string
    about_trainer_name: string
    about_trainer_title: string
    about_trainer_bio_1: string
    about_trainer_bio_2: string
    about_trainer_bio_3: string
    about_vision_statement: string
    about_vision_desc_1: string
    about_vision_desc_2: string
    about_vision_desc_3: string
    about_what_we_teach: string
    about_why_english_pesalam: string
    about_what_you_will_get: string
    about_our_impact: string
  }
}

export default function AboutSettingsForm({ initialValues }: AboutSettingsFormProps) {
  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={aboutSettingsSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await Promise.all([
            setSetting('about_tagline', values.about_tagline || ''),
            setSetting('about_title', values.about_title || ''),
            setSetting('about_description_1', values.about_description_1 || ''),
            setSetting('about_description_2', values.about_description_2 || ''),
            setSetting('about_description_3', values.about_description_3 || ''),
            setSetting('about_description_4', values.about_description_4 || ''),
            setSetting('about_trainer_name', values.about_trainer_name || ''),
            setSetting('about_trainer_title', values.about_trainer_title || ''),
            setSetting('about_trainer_bio_1', values.about_trainer_bio_1 || ''),
            setSetting('about_trainer_bio_2', values.about_trainer_bio_2 || ''),
            setSetting('about_trainer_bio_3', values.about_trainer_bio_3 || ''),
            setSetting('about_vision_statement', values.about_vision_statement || ''),
            setSetting('about_vision_desc_1', values.about_vision_desc_1 || ''),
            setSetting('about_vision_desc_2', values.about_vision_desc_2 || ''),
            setSetting('about_vision_desc_3', values.about_vision_desc_3 || ''),
            setSetting('about_what_we_teach', values.about_what_we_teach || '[]'),
            setSetting('about_why_english_pesalam', values.about_why_english_pesalam || '[]'),
            setSetting('about_what_you_will_get', values.about_what_you_will_get || '[]'),
            setSetting('about_our_impact', values.about_our_impact || '[]'),
          ])

          toast.success('About Us Page settings saved successfully!')
          window.location.reload()
        } catch {
          toast.error('Failed to save settings.')
        }
        setSubmitting(false)
      }}
    >
      {({ values, handleChange, handleBlur, errors, touched, isSubmitting }) => (
        <Form className="space-y-8 max-w-4xl">
          {/* Section 1: Hero Block */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="font-semibold text-gray-900 border-b pb-2">1. Header & Introduction Section</h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline / Slogan</label>
                <input
                  name="about_tagline"
                  value={values.about_tagline}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.about_tagline && touched.about_tagline && (
                  <p className="text-red-500 text-xs mt-1">{errors.about_tagline}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Main Heading</label>
                <input
                  name="about_title"
                  value={values.about_title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.about_title && touched.about_title && (
                  <p className="text-red-500 text-xs mt-1">{errors.about_title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description Paragraph 1 (Strong/Bold intro)</label>
                <textarea
                  name="about_description_1"
                  rows={2}
                  value={values.about_description_1}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description Paragraph 2</label>
                <textarea
                  name="about_description_2"
                  rows={3}
                  value={values.about_description_2}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description Paragraph 3</label>
                <textarea
                  name="about_description_3"
                  rows={3}
                  value={values.about_description_3}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description Paragraph 4 (Goal highlight)</label>
                <textarea
                  name="about_description_4"
                  rows={3}
                  value={values.about_description_4}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: About the Trainer */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="font-semibold text-gray-900 border-b pb-2">2. Trainer Information Section</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trainer Name</label>
                <input
                  name="about_trainer_name"
                  value={values.about_trainer_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.about_trainer_name && touched.about_trainer_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.about_trainer_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trainer Title / Designation</label>
                <input
                  name="about_trainer_title"
                  value={values.about_trainer_title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.about_trainer_title && touched.about_trainer_title && (
                  <p className="text-red-500 text-xs mt-1">{errors.about_trainer_title}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trainer Bio Paragraph 1</label>
                <textarea
                  name="about_trainer_bio_1"
                  rows={2}
                  value={values.about_trainer_bio_1}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trainer Bio Paragraph 2</label>
                <textarea
                  name="about_trainer_bio_2"
                  rows={2}
                  value={values.about_trainer_bio_2}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trainer Bio Paragraph 3 (Highlighted quote)</label>
                <textarea
                  name="about_trainer_bio_3"
                  rows={3}
                  value={values.about_trainer_bio_3}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm italic font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Vision Section */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="font-semibold text-gray-900 border-b pb-2">3. Vision Statement Section</h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vision Statement (Pill statement)</label>
                <input
                  name="about_vision_statement"
                  value={values.about_vision_statement}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-bold text-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vision Description Paragraph 1</label>
                <textarea
                  name="about_vision_desc_1"
                  rows={2}
                  value={values.about_vision_desc_1}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vision Description Paragraph 2</label>
                <textarea
                  name="about_vision_desc_2"
                  rows={2}
                  value={values.about_vision_desc_2}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vision Description Paragraph 3 (Closing Family note)</label>
                <textarea
                  name="about_vision_desc_3"
                  rows={2}
                  value={values.about_vision_desc_3}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Dynamic lists stored as JSON arrays */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="font-semibold text-gray-900 border-b pb-2">4. Interactive Lists & Dynamic Sections (JSON Editor)</h3>
            <div className="flex gap-2.5 p-4 rounded-lg bg-blue-50 border border-blue-100 text-blue-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-blue-600 mt-0.5" />
              <div>
                <span className="font-bold">JSON Data Note:</span> Below sections are stored as JSON arrays to maintain design fidelity. Please do not change the structural properties (<code className="bg-blue-100 px-1 rounded font-mono">title</code>, <code className="bg-blue-100 px-1 rounded font-mono">desc</code>, <code className="bg-blue-100 px-1 rounded font-mono">val</code>, <code className="bg-blue-100 px-1 rounded font-mono">label</code>), only update the text.
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">What We Teach (JSON Array of Objects)</label>
                <textarea
                  name="about_what_we_teach"
                  rows={8}
                  value={values.about_what_we_teach}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono bg-gray-50 text-gray-800"
                />
                {errors.about_what_we_teach && touched.about_what_we_teach && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">{errors.about_what_we_teach}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Why English Pesalam (JSON Array of Objects)</label>
                <textarea
                  name="about_why_english_pesalam"
                  rows={8}
                  value={values.about_why_english_pesalam}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono bg-gray-50 text-gray-800"
                />
                {errors.about_why_english_pesalam && touched.about_why_english_pesalam && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">{errors.about_why_english_pesalam}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">What You Will Get (JSON Array of Strings)</label>
                <textarea
                  name="about_what_you_will_get"
                  rows={6}
                  value={values.about_what_you_will_get}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono bg-gray-50 text-gray-800"
                />
                {errors.about_what_you_will_get && touched.about_what_you_will_get && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">{errors.about_what_you_will_get}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Our Impact Statistics (JSON Array of Objects)</label>
                <textarea
                  name="about_our_impact"
                  rows={8}
                  value={values.about_our_impact}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono bg-gray-50 text-gray-800"
                />
                {errors.about_our_impact && touched.about_our_impact && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">{errors.about_our_impact}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:bg-blue-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Settings...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
