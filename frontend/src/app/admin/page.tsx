/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { login, resetPassword } from '@/app/actions/auth'
import toast from 'react-hot-toast'
import { Formik, Form } from 'formik'
import { loginSchema } from '@/lib/validations/auth'
import { FormikInput } from '@/components/ui/FormikInput'
import { ArrowLeft, Mail } from 'lucide-react'

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (values: any) => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append('email', values.email)
    formData.append('password', values.password)
    
    const result = await login(formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        {/* ── SIGN IN VIEW ── */}
        <div>
          <div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 border-b pb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Admin Login
              </span>
            </h2>
            <p className="mt-4 text-center text-sm text-gray-600">
              Sign in to manage blogs and authors
            </p>
          </div>
          
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="mt-8 space-y-6">
                <div className="rounded-md space-y-4">
                  <FormikInput
                    label="Email Address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@example.com"
                  />
                  
                  <div>
                    <FormikInput
                      label="Password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading || isSubmitting}
                    className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                  >
                    {isLoading || isSubmitting ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}
