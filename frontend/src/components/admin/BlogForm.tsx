/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Upload, X, Loader2, Link as LinkIcon, PlusCircle, User, ChevronDown, ArrowLeft } from 'lucide-react'
import { saveBlog, uploadImage } from '@/app/actions/blog'
import toast from 'react-hot-toast'
import AuthorModal from './AuthorModal'
import { toWords } from 'number-to-words'
import { Modal } from '@/components/ui/Modal'

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

export default function BlogForm({ initialData, authors: initialAuthors }: BlogFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [featuredImage, setFeaturedImage] = useState(initialData?.featured_image || '')
  const [authorId, setAuthorId] = useState(initialData?.author_id || '')
  const [status, setStatus] = useState(initialData?.status || 'published')
  
  const [authors, setAuthors] = useState(initialAuthors)
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false)
  const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isBackModalOpen, setIsBackModalOpen] = useState(false)

  // Auto-generate slug when title changes (only for new blogs)
  useEffect(() => {
    if (!initialData && title) {
      setSlug(generateSlug(title))
    }
  }, [title, initialData])

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
      setFeaturedImage(result.url)
      toast.success('Image uploaded successfully')
    }
    setIsUploading(false)
  }

  const submitWithStatus = async (overrideStatus?: string) => {
    if (!title || !slug || !content || !authorId) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('slug', slug)
    formData.append('content', content)
    formData.append('featured_image', featuredImage)
    formData.append('author_id', authorId)
    formData.append('status', overrideStatus || status)

    const result = await saveBlog(formData, initialData?.id)

    if (result.error) {
      toast.error(result.error)
      setIsSaving(false)
    } else {
      toast.success(initialData ? 'Blog updated successfully' : 'Blog created successfully')
      router.push('/admin/blogs')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitWithStatus()
  }

  const isDirty = () => {
    return title !== (initialData?.title || '') ||
           slug !== (initialData?.slug || '') ||
           content !== (initialData?.content || '') ||
           featuredImage !== (initialData?.featured_image || '') ||
           authorId !== (initialData?.author_id || '');
  }

  const handleBack = () => {
    if (isDirty()) {
      setIsBackModalOpen(true);
    } else {
      router.push('/admin/blogs');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNewAuthor = (newAuthor: any) => {
    setAuthors([newAuthor, ...authors])
    setAuthorId(newAuthor.id)
  }

  return (
    <>
      <div className="mb-4">
        <button type="button" onClick={handleBack} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to blogs
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blog Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg font-medium"
                  placeholder="Enter blog title"
                  required
                />
              </div>

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
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-700"
                    placeholder="my-cool-blog"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <RichTextEditor value={content} onChange={setContent} />
                </div>
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
                    onClick={() => setStatus('draft')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      status === 'draft' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('published')}
                    className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      status === 'published' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
                  >
                    {status === 'published' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse"></span>}
                    Published
                  </button>
                </div>
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
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save'}
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
                    onClick={() => setIsAuthorDropdownOpen(!isAuthorDropdownOpen)}
                    className={`w-full pl-11 pr-10 py-3 border rounded-xl bg-white shadow-sm cursor-pointer transition-all flex items-center min-h-[50px] relative z-40 group-hover:border-gray-300 ${isAuthorDropdownOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'}`}
                  >
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      {authors.find(a => a.id === authorId)?.profile_image ? (
                        <img src={authors.find(a => a.id === authorId)?.profile_image} alt="" className="w-6 h-6 rounded-full object-cover shadow-sm" />
                      ) : (
                        <User className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      )}
                    </div>
                    <span className={`block truncate ${!authorId ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                      {authorId ? authors.find(a => a.id === authorId)?.name : 'Select an author'}
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
                              setAuthorId(author.id);
                              setIsAuthorDropdownOpen(false);
                            }}
                            className={`flex items-center px-4 py-3 hover:bg-blue-50/50 cursor-pointer transition-colors ${authorId === author.id ? 'bg-blue-50/80' : ''}`}
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
                              <div className={`font-medium text-sm truncate ${authorId === author.id ? 'text-blue-700' : 'text-gray-900'}`}>{author.name}</div>
                              {author.designation && <div className="text-xs text-gray-500 mt-0.5 truncate">{author.designation}</div>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Featured Image</h3>
              
              <div className="space-y-4">
                {featuredImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={featuredImage} alt="Featured" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => setFeaturedImage('')}
                      className="absolute top-2 right-2 p-1 bg-white/80 backdrop-blur rounded-full text-red-600 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    )}
                    <div className="text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 outline-none hover:text-blue-500 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a file</span>
                        <input name="file_upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" disabled={isUploading} />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or link from URL</span>
                  </div>
                </div>
                
                <div className="flex rounded-md shadow-sm">
                  <div className="relative flex-grow focus-within:z-10">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md pl-10 sm:text-sm border-gray-300 border py-2"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </form>

      <AuthorModal 
        isOpen={isAuthorModalOpen} 
        onClose={() => setIsAuthorModalOpen(false)} 
        onSuccess={handleNewAuthor}
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
                submitWithStatus('draft');
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
}
