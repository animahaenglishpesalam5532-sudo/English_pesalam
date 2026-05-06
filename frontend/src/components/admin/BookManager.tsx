'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Plus, Pencil, Trash2, X, Upload, Loader2,
  Eye, EyeOff, BookOpen, ChevronUp, ChevronDown, Link as LinkIcon
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getBooks, createBook, updateBook, deleteBook, Book, BookInput } from '@/app/actions/books'
import { uploadImage } from '@/app/actions/blog'
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik'
import * as Yup from 'yup'

const BookSchema = Yup.object().shape({
  title_1: Yup.string().required('Title Line 1 is required'),
  title_2: Yup.string(),
  description: Yup.string().required('Description is required'),
  price: Yup.string().required('Current Price is required'),
  strikethrough_price: Yup.string(),
  image_url: Yup.string().required('Book Cover image is required'),
  whatsapp_number: Yup.string().required('WhatsApp Number is required'),
  whatsapp_message: Yup.string().required('WhatsApp Message is required'),
  sort_order: Yup.number().required('Sort order is required'),
  is_visible: Yup.boolean().required(),
})

const emptyForm: BookInput = {
  title_1: '',
  title_2: '',
  description: '',
  price: '',
  strikethrough_price: '',
  image_url: '',
  whatsapp_number: '',
  whatsapp_message: '',
  sort_order: 0,
  is_visible: true,
}

export default function BookManager() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const refresh = async () => {
    setLoading(true)
    const data = await getBooks()
    setBooks(data)
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  const openAdd = () => {
    setEditingBook(null)
    setModalOpen(true)
  }

  const openEdit = (book: Book) => {
    setEditingBook(book)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingBook(null)
  }

  const handleFormSubmit = async (values: BookInput, { setSubmitting }: FormikHelpers<BookInput>) => {
    const payload: BookInput = {
      ...values,
      title_1: values.title_1.trim(),
      sort_order: Number(values.sort_order) || 0,
    }
    const result = editingBook
      ? await updateBook(editingBook.id, payload)
      : await createBook(payload)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(editingBook ? 'Book updated!' : 'Book added!')
      closeModal()
      await refresh()
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    const result = await deleteBook(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Book deleted')
      setDeleteConfirm(null)
      await refresh()
    }
  }


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return null

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB')
      e.target.value = ''
      return null
    }

    setIsUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const result = await uploadImage(fd)
    if (result.error) {
      toast.error(result.error)
    } else if (result.url) {
      toast.success('Image uploaded')
    }
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    return result.url
  }

  const visibleCount = books.filter(b => b.is_visible).length

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Home Page Book Details</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maximum 2 visible books shown on the home page.&nbsp;
            <span className={visibleCount >= 2 ? 'text-amber-500 font-semibold' : 'text-emerald-600 font-semibold'}>
              {visibleCount} / 2 visible
            </span>
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Book
        </button>
      </div>

      {/* Book List */}
      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-xl border border-slate-100">
                <div className="w-16 h-20 bg-slate-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-slate-500 text-sm">No books yet. Click <strong>Add Book</strong> to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {books.map((book) => (
              <div
                key={book.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors group"
              >
                {/* Cover Thumbnail */}
                <div className="w-14 h-18 flex-shrink-0">
                  {book.image_url ? (
                    <img
                      src={book.image_url}
                      alt={book.title_1}
                      className="w-14 h-[72px] object-cover rounded-lg border border-slate-200"
                    />
                  ) : (
                    <div className="w-14 h-[72px] rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-indigo-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{book.title_1}</p>
                  {book.title_2 && (
                    <p className="text-xs text-slate-500 truncate">{book.title_2}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {book.price && (
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {book.price}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        book.is_visible
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-slate-500 bg-slate-100'
                      }`}
                    >
                      {book.is_visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {book.is_visible ? 'Visible' : 'Hidden'}
                    </span>
                    <span className="text-xs text-slate-400">Order: {book.sort_order}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(book)}
                    className="p-2 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {deleteConfirm === book.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-red-500 font-medium">Sure?</span>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="px-2 py-1 text-xs rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 text-xs rounded-lg bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(book.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <Formik
              initialValues={editingBook ? {
                title_1: editingBook.title_1,
                title_2: editingBook.title_2 || '',
                description: editingBook.description || '',
                price: editingBook.price || '',
                strikethrough_price: editingBook.strikethrough_price || '',
                image_url: editingBook.image_url || '',
                whatsapp_number: editingBook.whatsapp_number || '',
                whatsapp_message: editingBook.whatsapp_message || '',
                sort_order: editingBook.sort_order,
                is_visible: editingBook.is_visible,
              } : { ...emptyForm, sort_order: books.length, is_visible: books.filter(b => b.is_visible).length < 2 }}
              validationSchema={BookSchema}
              onSubmit={handleFormSubmit}
              enableReinitialize
            >
              {({ values, setFieldValue, isSubmitting, errors, touched }) => (
                <Form className="flex flex-col flex-1 overflow-hidden">
                  {/* Modal Body */}
                  <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                    {/* Title Lines */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                          Title Line 1 <span className="text-red-500">*</span>
                        </label>
                        <Field
                          name="title_1"
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition ${
                            errors.title_1 && touched.title_1 ? 'border-red-400 bg-red-50' : 'border-slate-200'
                          }`}
                          placeholder="1000 + English Words"
                        />
                        <ErrorMessage name="title_1" component="p" className="mt-1 text-xs text-red-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                          Title Line 2
                        </label>
                        <Field
                          name="title_2"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition"
                          placeholder="Book 1 – Basic Level"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="description"
                        rows={3}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition resize-none ${
                          errors.description && touched.description ? 'border-red-400 bg-red-50' : 'border-slate-200'
                        }`}
                        placeholder="Brief description of the book..."
                      />
                      <ErrorMessage name="description" component="p" className="mt-1 text-xs text-red-500" />
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                          Current Price <span className="text-red-500">*</span>
                        </label>
                        <Field
                          name="price"
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition ${
                            errors.price && touched.price ? 'border-red-400 bg-red-50' : 'border-slate-200'
                          }`}
                          placeholder="₹339"
                        />
                        <ErrorMessage name="price" component="p" className="mt-1 text-xs text-red-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                          Original Price
                        </label>
                        <Field
                          name="strikethrough_price"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition"
                          placeholder="₹399"
                        />
                      </div>
                    </div>

                    {/* Book Cover Image */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                        Book Cover Image <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-start gap-4">
                        {values.image_url ? (
                          <div className="relative w-24 h-28 flex-shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                            <img src={values.image_url} alt="Book cover" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setFieldValue('image_url', '')}
                              className="absolute top-1 right-1 p-1 bg-red-100 rounded-full text-red-500 hover:bg-red-200 transition-colors shadow-sm"
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
                              {isUploading ? 'Uploading...' : values.image_url ? 'Replace image via upload' : 'Upload book cover'}
                            </span>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploading}
                              onChange={async (e) => {
                                const url = await handleImageUpload(e);
                                if (url) setFieldValue('image_url', url);
                              }}
                            />
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <LinkIcon className="w-4 h-4 text-slate-400" />
                            </div>
                            <Field
                              name="image_url"
                              placeholder="Or enter image URL..."
                              className={`w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition ${
                                errors.image_url && touched.image_url ? 'border-red-400 bg-red-50' : 'border-slate-200'
                              }`}
                            />
                          </div>
                          <ErrorMessage name="image_url" component="p" className="mt-1 text-xs text-red-500" />
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Buy Button</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                            WhatsApp Number <span className="text-red-500">*</span>
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">Country code without + (e.g. 919345639627)</p>
                          <Field
                            name="whatsapp_number"
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition bg-white ${
                              errors.whatsapp_number && touched.whatsapp_number ? 'border-red-400 bg-red-50' : 'border-slate-200'
                            }`}
                            placeholder="919345639627"
                          />
                          <ErrorMessage name="whatsapp_number" component="p" className="mt-1 text-xs text-red-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                            WhatsApp Message <span className="text-red-500">*</span>
                          </label>
                          <p className="text-[11px] text-slate-400 mb-1.5">Pre-filled message when user taps Buy Now</p>
                          <Field
                            as="textarea"
                            name="whatsapp_message"
                            rows={3}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition resize-none bg-white ${
                              errors.whatsapp_message && touched.whatsapp_message ? 'border-red-400 bg-red-50' : 'border-slate-200'
                            }`}
                            placeholder="I want to buy the English Pesalam book"
                          />
                          <ErrorMessage name="whatsapp_message" component="p" className="mt-1 text-xs text-red-500" />
                        </div>
                      </div>
                    </div>

                    {/* Visibility & Sort Order */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                          Sort Order
                        </label>
                        <div className="flex items-center gap-2">
                          <Field
                            type="number"
                            name="sort_order"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-300 transition"
                            min={0}
                          />
                          <div className="flex flex-col gap-1">
                            <button type="button" onClick={() => setFieldValue('sort_order', Math.max(0, values.sort_order - 1))} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" onClick={() => setFieldValue('sort_order', values.sort_order + 1)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                          Visibility
                        </label>
                        {(() => {
                          const otherVisibleCount = books.filter(b => b.is_visible && b.id !== editingBook?.id).length;
                          const canMakeVisible = otherVisibleCount < 2;
                          const isDisabled = !values.is_visible && !canMakeVisible;
                          
                          return (
                            <button
                              type="button"
                              onClick={() => {
                                if (!isDisabled) {
                                  setFieldValue('is_visible', !values.is_visible);
                                }
                              }}
                              disabled={isDisabled}
                              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                                values.is_visible
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                  : isDisabled
                                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                              }`}
                              title={isDisabled ? "Maximum 2 books can be visible on home page" : ""}
                            >
                              {values.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              {values.is_visible ? 'Visible on Home' : 'Hidden'}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow hover:bg-indigo-700 disabled:opacity-60 transition-colors"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isSubmitting ? 'Saving...' : editingBook ? 'Save Changes' : 'Add Book'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  )
}
