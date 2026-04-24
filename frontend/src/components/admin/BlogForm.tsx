/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Upload, X, Loader2, Link as LinkIcon, PlusCircle, User, ChevronDown, ArrowLeft } from 'lucide-react'
import { saveBlog, uploadImage, getFeaturedBlogsCount } from '@/app/actions/blog'
import toast from 'react-hot-toast'
import AuthorModal from './AuthorModal'
import { toWords } from 'number-to-words'
import { Modal } from '@/components/ui/Modal'
import { Formik, Form, useFormikContext } from 'formik'
import { blogSchema } from '@/lib/validations/blog'
import { FormikInput } from '@/components/ui/FormikInput'

// Dynamically import the RichTextEditor to avoid SSR hydration issues
const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false, loading: () => <div className="h-64 flex items-center justify-center bg-gray-50 border rounded-lg">Loading Editor...</div> })

interface BlogFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authors: any[]
}

const generateSlug = (title: string) => {
  const titleWithWords = title.replace(/\d+/g, (match) => `-${toWords(Number(match))}-`);
  return titleWithWords
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// Helper component to watch title and auto-generate slug
const AutoSlugGenerator = ({ initialData }: { initialData: any }) => {
  const { values, setFieldValue, touched } = useFormikContext<any>()
  
  useEffect(() => {
    if (!initialData && values.title && !touched.slug) {
      setFieldValue('slug', generateSlug(values.title))
    }
  }, [values.title, initialData, setFieldValue, touched.slug])
  
  return null
}

export default function BlogForm({ initialData, authors: initialAuthors }: BlogFormProps) {
  const router = useRouter()
  
  const initialDefaultAuthor = initialAuthors?.find((a: any) => a.is_default)
    || (initialAuthors?.length > 0 ? initialAuthors[0] : null);

  const [authors, setAuthors] = useState(initialAuthors)
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false)
  const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isBackModalOpen, setIsBackModalOpen] = useState(false)
  const [isCheckingFeatured, setIsCheckingFeatured] = useState(false)
  
  // Temporary state for the modal's save to draft action
  const [tempDraftSave, setTempDraftSave] = useState<(() => void) | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNewAuthor = (newAuthor: any, setFieldValue: any) => {
    setAuthors([newAuthor, ...authors])
    setFieldValue('author_id', newAuthor.id)
  }

  return (
    <Formik
      initialValues={{
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        content: initialData?.content || '',
        featured_image: initialData?.featured_image || '',
        author_id: initialData?.author_id || (initialDefaultAuthor ? initialDefaultAuthor.id : ''),
        status: initialData?.status || 'published',
        is_featured: initialData?.is_featured || false,
        meta_title: initialData?.meta_title || '',
        meta_description: initialData?.meta_description || '',
      }}
      validationSchema={blogSchema}
      onSubmit={async (values, { setSubmitting }) => {
        const formData = new FormData()
        formData.append('title', values.title)
        formData.append('slug', values.slug)
        formData.append('content', values.content)
        formData.append('featured_image', values.featured_image)
        formData.append('author_id', values.author_id)
        formData.append('status', values.status)
        formData.append('is_featured', String(values.is_featured))
        formData.append('meta_title', values.meta_title || '')
        formData.append('meta_description', values.meta_description || '')

        const result = await saveBlog(formData, initialData?.id)

        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success(initialData ? 'Blog updated successfully' : 'Blog created successfully')
          router.push('/admin/blogs')
        }
        setSubmitting(false)
      }}
    >
      {({ values, setFieldValue, isSubmitting, dirty, submitForm, errors, touched, setFieldTouched }) => {
        
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
            setFieldValue('featured_image', result.url)
            toast.success('Image uploaded successfully')
          }
          setIsUploading(false)
        }

        const handleBack = () => {
          if (dirty) {
            // Setup a callback so the modal can trigger a draft save
            setTempDraftSave(() => {
              return () => {
                setFieldValue('status', 'draft')
                setTimeout(() => submitForm(), 0)
              }
            })
            setIsBackModalOpen(true)
          } else {
            router.push('/admin/blogs')
          }
        }

        const handleFeaturedToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const isChecked = e.target.checked
          if (isChecked) {
            setIsCheckingFeatured(true)
            const count = await getFeaturedBlogsCount(initialData?.id)
            setIsCheckingFeatured(false)
            if (count >= 3) {
              toast.error('You can only have up to 3 featured blogs. Please unfeature another blog first.')
              return
            }
          }
          setFieldValue('is_featured', isChecked)
        }

        return (
          <>
            <AutoSlugGenerator initialData={initialData} />
            
            <div className="mb-4">
              <button type="button" onClick={handleBack} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to blogs
              </button>
            </div>
            
            <Form className="space-y-8 max-w-6xl w-full">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Column */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                    <FormikInput
                      label="Blog Title *"
                      name="title"
                      placeholder="Enter blog title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                        <span>URL Slug *</span>
                        <span className="text-xs text-gray-400 font-normal">e.g. my-first-blog-post</span>
                      </label>
                      <div className="flex rounded-lg shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          /blogs/
                        </span>
                        <input
                          name="slug"
                          value={values.slug}
                          onChange={(e) => {
                            setFieldValue('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                          }}
                          onBlur={() => setFieldTouched('slug', true)}
                          className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-lg border focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            errors.slug && touched.slug ? 'border-red-300 text-red-900' : 'border-gray-300 text-gray-700'
                          }`}
                          placeholder="my-cool-blog"
                        />
                      </div>
                      {errors.slug && touched.slug && (
                        <div className="mt-1 text-sm text-red-600">{errors.slug as string}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                      <div className={`border rounded-lg overflow-hidden ${errors.content && touched.content ? 'border-red-300' : 'border-gray-300'}`}>
                        <RichTextEditor 
                          value={values.content} 
                          onChange={(val) => {
                            setFieldValue('content', val)
                            setFieldTouched('content', true, false)
                          }} 
                        />
                      </div>
                      {errors.content && touched.content && (
                        <div className="mt-1 text-sm text-red-600">{errors.content as string}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Publish Settings</h3>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">Status</label>
                      <div className="flex bg-gray-100/80 p-1.5 rounded-xl border border-gray-100">
                        <button
                          type="button"
                          onClick={() => setFieldValue('status', 'draft')}
                          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${values.status === 'draft' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                        >
                          Draft
                        </button>
                        <button
                          type="button"
                          onClick={() => setFieldValue('status', 'published')}
                          className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all duration-200 ${values.status === 'published' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                        >
                          {values.status === 'published' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>}
                          Published
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={`flex items-center space-x-3 cursor-pointer bg-gray-50/50 p-3 rounded-xl border border-gray-100 transition-colors ${isCheckingFeatured ? 'opacity-50 cursor-wait' : 'hover:bg-gray-100'}`}>
                        <input
                          type="checkbox"
                          checked={values.is_featured}
                          onChange={handleFeaturedToggle}
                          disabled={isCheckingFeatured}
                          className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {isCheckingFeatured ? 'Checking...' : 'Make this a Featured Blog'}
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1.5 ml-1">Featured blogs appear prominently at the top of the blog page. (Max 3)</p>
                    </div>

                    <div className="pt-4 flex space-x-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                      >
                        {isSubmitting ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Author Selection</h3>

                    <div>
                      <div className="flex justify-between items-center mb-3 ml-1">
                        <label className="block text-sm font-semibold text-gray-700">Author *</label>
                        <button
                          type="button"
                          onClick={() => setIsAuthorModalOpen(true)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center bg-blue-50/80 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
                        >
                          <PlusCircle className="w-3 h-3 mr-1.5" /> New Author
                        </button>
                      </div>
                      <div className="relative group">
                        {isAuthorDropdownOpen && (
                          <div className="fixed inset-0 z-40" onClick={() => setIsAuthorDropdownOpen(false)}></div>
                        )}
                        <div
                          onClick={() => {
                            setIsAuthorDropdownOpen(!isAuthorDropdownOpen)
                            setFieldTouched('author_id', true)
                          }}
                          className={`w-full pl-11 pr-10 py-3 border rounded-xl bg-white shadow-sm cursor-pointer transition-all flex items-center min-h-[50px] relative z-40 group-hover:border-gray-300 ${isAuthorDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : (errors.author_id && touched.author_id ? 'border-red-300 ring-1 ring-red-300' : 'border-gray-200')}`}
                        >
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            {authors.find(a => a.id === values.author_id)?.profile_image ? (
                              <img src={authors.find(a => a.id === values.author_id)?.profile_image} alt="" className="w-6 h-6 rounded-full object-cover shadow-sm" />
                            ) : (
                              <User className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            )}
                          </div>
                          <span className={`block truncate ${!values.author_id ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                            {values.author_id ? authors.find(a => a.id === values.author_id)?.name : 'Select an author'}
                          </span>
                          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                            <ChevronDown className={`h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${isAuthorDropdownOpen ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        {/* Custom Dropdown Menu */}
                        <div className={`absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl py-2 transition-all origin-top duration-200 ${isAuthorDropdownOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}`}>
                          <div className="max-h-60 overflow-y-auto">
                            {authors.length === 0 ? (
                              <div className="px-4 py-3 text-sm text-gray-500 text-center">No authors available.</div>
                            ) : (
                              authors.map((author) => (
                                <div
                                  key={author.id}
                                  onClick={() => {
                                    setFieldValue('author_id', author.id);
                                    setIsAuthorDropdownOpen(false);
                                  }}
                                  className={`flex items-center px-4 py-3 hover:bg-blue-50/50 cursor-pointer transition-colors ${values.author_id === author.id ? 'bg-blue-50/80' : ''}`}
                                >
                                  <div className="flex-shrink-0 mr-3">
                                    {author.profile_image ? (
                                      <img src={author.profile_image} alt={author.name} className="w-8 h-8 rounded-full object-cover shadow-sm bg-gray-50" />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <User className="w-4 h-4 text-blue-600" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className={`font-medium text-sm truncate ${values.author_id === author.id ? 'text-blue-700' : 'text-gray-900'}`}>{author.name}</div>
                                    {author.designation && <div className="text-xs text-gray-500 mt-0.5 truncate">{author.designation}</div>}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                      {errors.author_id && touched.author_id && (
                        <div className="mt-1 text-sm text-red-600">{errors.author_id as string}</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Featured Image</h3>

                    <div className="space-y-3">
                      {values.featured_image ? (
                        <div className="relative rounded-xl overflow-hidden border border-indigo-200 group">
                          <img src={values.featured_image} alt="Featured" className="w-full h-40 object-cover" />
                          <button
                            type="button"
                            onClick={() => setFieldValue('featured_image', '')}
                            className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-full text-red-600 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/60 cursor-pointer hover:border-indigo-500 hover:bg-indigo-100/60 transition-colors text-center">
                          {isUploading ? (
                            <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
                          ) : (
                            <Upload className="w-7 h-7 text-indigo-400" />
                          )}
                          <span className="text-sm text-slate-500">
                            {isUploading ? 'Uploading...' : 'Upload a file'}
                          </span>
                          <input name="file_upload" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={isUploading} />
                        </label>
                      )}

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LinkIcon className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="url"
                          value={values.featured_image}
                          onChange={(e) => setFieldValue('featured_image', e.target.value)}
                          onBlur={() => setFieldTouched('featured_image', true)}
                          className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition ${
                            errors.featured_image && touched.featured_image ? 'border-red-300 text-red-900' : 'border-slate-200'
                          }`}
                          placeholder="Or enter image URL..."
                        />
                      </div>
                      {errors.featured_image && touched.featured_image && (
                        <div className="mt-1 text-sm text-red-600">{errors.featured_image as string}</div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* SEO Meta Card — full width */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                <div>
                  <h3 className="font-semibold text-gray-900 border-b pb-2">SEO Meta</h3>
                  <p className="text-xs text-gray-400 mt-2">Leave blank to auto-generate from title &amp; content.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Meta Title */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium text-gray-700">Meta Title</label>
                      <span className={`text-xs font-mono ${(values.meta_title?.length || 0) > 60 ? 'text-red-500' : 'text-gray-400'}`}>
                        {values.meta_title?.length || 0}/60
                      </span>
                    </div>
                    <input
                      name="meta_title"
                      value={values.meta_title || ''}
                      onChange={(e) => setFieldValue('meta_title', e.target.value)}
                      maxLength={60}
                      placeholder={`${values.title?.substring(0, 60) || 'Auto-generated from title'}`}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition ${errors.meta_title && touched.meta_title ? 'border-red-300' : 'border-slate-200'}`}
                    />
                    {errors.meta_title && touched.meta_title && (
                      <p className="mt-1 text-xs text-red-500">{errors.meta_title as string}</p>
                    )}
                  </div>

                  {/* Meta Description */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium text-gray-700">Meta Description</label>
                      <span className={`text-xs font-mono ${(values.meta_description?.length || 0) > 200 ? 'text-red-500' : 'text-gray-400'}`}>
                        {values.meta_description?.length || 0}/200
                      </span>
                    </div>
                    <textarea
                      name="meta_description"
                      value={values.meta_description || ''}
                      onChange={(e) => setFieldValue('meta_description', e.target.value)}
                      maxLength={200}
                      rows={3}
                      placeholder="Auto-generated from content summary..."
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition resize-none ${errors.meta_description && touched.meta_description ? 'border-red-300' : 'border-slate-200'}`}
                    />
                    {errors.meta_description && touched.meta_description && (
                      <p className="mt-1 text-xs text-red-500">{errors.meta_description as string}</p>
                    )}
                  </div>
                </div>
              </div>

            </Form>

            <AuthorModal
              isOpen={isAuthorModalOpen}
              onClose={() => setIsAuthorModalOpen(false)}
              onSuccess={(newAuthor) => handleNewAuthor(newAuthor, setFieldValue)}
            />

            <Modal
              isOpen={isBackModalOpen}
              onClose={() => setIsBackModalOpen(false)}
              title="Unsaved Changes"
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  You have unsaved changes. Do you want to save this blog as a draft or discard your changes?
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => setIsBackModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => router.push('/admin/blogs')}
                    className="flex-1 px-4 py-2 border border-red-200 text-red-700 shadow-sm text-sm font-medium rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    Discard (OK)
                  </button>
                  <button
                    onClick={() => {
                      setIsBackModalOpen(false);
                      if (tempDraftSave) tempDraftSave();
                    }}
                    className="flex-1 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Save to Draft
                  </button>
                </div>
              </div>
            </Modal>
          </>
        )
      }}
    </Formik>
  )
}
