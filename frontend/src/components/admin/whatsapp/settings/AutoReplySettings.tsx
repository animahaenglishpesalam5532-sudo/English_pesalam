'use client'

import React from 'react'
import Link from 'next/link'
import { Formik, Form, Field, ErrorMessage, type FieldProps } from 'formik'
import * as Yup from 'yup'
import toast from 'react-hot-toast'
import { ArrowLeft, AlertTriangle, Info } from 'lucide-react'
import { CARD, LABEL } from '../styles'
import { AutoReplyPreview } from './AutoReplyPreview'
import { saveAutoReplyMessage, type AutoReplySettings as Settings } from '@/app/actions/whatsappSettings'

/** Meta's cap on a text message body. Mirrors AUTO_REPLY_MAX_LENGTH. */
const MAX_LENGTH = 4096

const HAS_PHONE = /\d{8,}/

const schema = Yup.object({
  message: Yup.string()
    .trim()
    .required('Message cannot be empty')
    .max(MAX_LENGTH, `Message must be ${MAX_LENGTH} characters or fewer`),
})

export default function AutoReplySettings({ initial }: { initial: Settings }) {
  return (
    <div>
      <Link
        href="/admin/whatsapp"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        WhatsApp
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Auto-reply message</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sent automatically the first time a customer messages you, at most once per number
          every 24 hours. Saved changes apply to the very next reply — no redeploy needed.
        </p>
      </div>

      <Formik
        initialValues={{ message: initial?.message ?? '' }}
        validationSchema={schema}
        onSubmit={async (values, { resetForm }) => {
          const result = await saveAutoReplyMessage(values.message)

          if (result?.error) {
            toast.error(result.error)
            return
          }

          toast.success('Auto-reply message saved')
          // Re-baseline so the form is no longer dirty against the old text.
          resetForm({ values: { message: values.message.trim() } })
        }}
      >
        {({ values, dirty, isSubmitting, isValid }) => {
          const length = values?.message?.length ?? 0
          const overLimit = length > MAX_LENGTH

          return (
            <Form className="space-y-6">
              <div className={`${CARD} p-4`}>
                <label htmlFor="message" className={LABEL}>
                  Message
                </label>

                <Field name="message">
                  {({ field }: FieldProps) => (
                    <textarea
                      {...field}
                      id="message"
                      rows={6}
                      className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                        overLimit
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                      }`}
                      placeholder="What should customers receive when they first message you?"
                    />
                  )}
                </Field>

                <div className="mt-1.5 flex items-start justify-between gap-4">
                  <ErrorMessage
                    name="message"
                    component="p"
                    className="text-xs font-medium text-red-600"
                  />
                  <span
                    className={`ml-auto shrink-0 text-xs tabular-nums ${
                      overLimit ? 'font-semibold text-red-600' : 'text-gray-400'
                    }`}
                  >
                    {length} / {MAX_LENGTH}
                  </span>
                </div>

                {values?.message?.trim() && !HAS_PHONE.test(values.message) && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-600">
                    <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
                    No phone number detected — customers will have no number to contact you on.
                  </p>
                )}

                {initial?.isDefault && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
                    <Info className="mt-px h-3.5 w-3.5 shrink-0" />
                    Showing the built-in default. Nothing has been saved yet — run migration 014
                    or just save once.
                  </p>
                )}
              </div>

              <div>
                <h2 className="mb-2 text-sm font-semibold text-gray-900">Preview</h2>
                <p className="mb-3 text-xs text-gray-500">
                  How it appears in the customer&apos;s chat. WhatsApp turns phone numbers into
                  tappable links automatically.
                </p>
                <AutoReplyPreview message={values?.message ?? ''} />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!dirty || isSubmitting || !isValid}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isSubmitting ? 'Saving…' : 'Save message'}
                </button>
                {dirty && !isSubmitting && (
                  <span className="text-xs text-gray-500">Unsaved changes</span>
                )}
              </div>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
}
