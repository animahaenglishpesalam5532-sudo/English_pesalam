'use client'

import React from 'react'
import { useField } from 'formik'

interface FormikTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string
  label?: string
  hint?: string
}

export const FormikTextarea: React.FC<FormikTextareaProps> = ({ label, hint, ...props }) => {
  const [field, meta] = useField(props)
  
  const hasError = meta.touched && meta.error

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
          <span>{label}</span>
          {hint && <span className="text-xs text-gray-400 font-normal">{hint}</span>}
        </label>
      )}
      <textarea
        {...field}
        {...props}
        className={`${props.className || 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 sm:text-sm'} ${
          hasError 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 text-red-900 placeholder-red-300' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500'
        }`}
      />
      {hasError ? (
        <div className="mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1">
          {meta.error}
        </div>
      ) : null}
    </div>
  )
}
