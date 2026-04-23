/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { saveAuthor } from '@/app/actions/author'
import { uploadImage } from '@/app/actions/blog'
import { Upload, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Formik, Form, Field } from 'formik'
import { authorSchema } from '@/lib/validations/author'
import { FormikInput } from '@/components/ui/FormikInput'
import { FormikTextarea } from '@/components/ui/FormikTextarea'

interface AuthorModalProps {
  isOpen: boolean
  onClose: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (author: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any
}

export default function AuthorModal({ isOpen, onClose, onSuccess, initialData }: AuthorModalProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    const formData = new FormData()
    formData.set('name', values.name)
    formData.set('designation', values.designation || '')
    formData.set('bio', values.bio || '')
    formData.set('profile_image', values.profile_image || '')
    formData.set('is_default', values.is_default ? 'true' : 'false')

    const result = await saveAuthor(formData, initialData?.id)

    if (result.error) {
      toast.error(result.error)
    } else if (result.success && result.author) {
      toast.success(initialData ? 'Author updated successfully!' : 'Author created successfully!')
      onSuccess(result.author)
      onClose()
    }

    setSubmitting(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Author" : "Create New Author"}>
      <Formik
        initialValues={{
          name: initialData?.name || '',
          designation: initialData?.designation || '',
          bio: initialData?.bio || '',
          profile_image: initialData?.profile_image || '',
          is_default: initialData?.is_default || false,
        }}
        validationSchema={authorSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => {
          const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (!file) return

            setIsUploading(true)
            const formData = new FormData()
            formData.append('file', file)

            const result = await uploadImage(formData)
            if (result.error) {
              toast.error(result.error)
            } else if (result.url) {
              setFieldValue('profile_image', result.url)
              toast.success('Image uploaded successfully')
            }
            setIsUploading(false)
          }

          return (
            <Form className="space-y-4">
              <FormikInput
                label="Author Name *"
                name="name"
                placeholder="John Doe"
              />
              
              <FormikInput
                label="Designation"
                name="designation"
                placeholder="Senior Editor"
              />
              
              <FormikTextarea
                label="Author Bio"
                name="bio"
                rows={3}
                placeholder="A brief bio about the author..."
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                <div className="space-y-3">
                  {values.profile_image ? (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 group w-24 h-24">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={values.profile_image} alt="Profile" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFieldValue('profile_image', '')}
                        className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur rounded-full text-red-600 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
                      {isUploading ? (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin mb-1" />
                      ) : (
                        <Upload className="w-5 h-5 text-gray-400 mb-1" />
                      )}
                      <div className="text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-transparent font-medium text-blue-600 outline-none hover:text-blue-500">
                          <span>Upload image</span>
                          <input type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" disabled={isUploading} />
                        </label>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="mr-2">Or URL:</span>
                    <input
                      type="url"
                      value={values.profile_image}
                      onChange={(e) => setFieldValue('profile_image', e.target.value)}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mt-2 cursor-pointer">
                  <Field
                    type="checkbox"
                    name="is_default"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span>Make this the default author</span>
                </label>
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (initialData ? 'Update Author' : 'Save Author')}
                </button>
              </div>
            </Form>
          )
        }}
      </Formik>
    </Modal>
  )
}
