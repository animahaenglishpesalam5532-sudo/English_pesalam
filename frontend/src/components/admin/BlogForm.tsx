/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Upload, X, Loader2, Link as LinkIcon, PlusCircle } from 'lucide-react'
import { saveBlog, uploadImage } from '@/app/actions/blog'
import toast from 'react-hot-toast'
import AuthorModal from './AuthorModal'
import { toWords } from 'number-to-words'

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
  const [status, setStatus] = useState(initialData?.status || 'draft')
  
  const [authors, setAuthors] = useState(initialAuthors)
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
    formData.append('status', status)

    const result = await saveBlog(formData, initialData?.id)

    if (result.error) {
      toast.error(result.error)
      setIsSaving(false)
    } else {
      toast.success(initialData ? 'Blog updated successfully' : 'Blog created successfully')
      router.push('/admin/blogs')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNewAuthor = (newAuthor: any) => {
    setAuthors([newAuthor, ...authors])
    setAuthorId(newAuthor.id)
  }

  return (
    <>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/admin/blogs')}
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Author *</label>
                  <button
                    type="button"
                    onClick={() => setIsAuthorModalOpen(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <PlusCircle className="w-3 h-3 mr-1" /> New
                  </button>
                </div>
                <select
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                  required
                >
                  <option value="" disabled>Select an author</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
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
    </>
  )
}
