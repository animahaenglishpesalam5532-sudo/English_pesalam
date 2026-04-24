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
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail.trim()) {
      toast.error('Please enter your email address')
      return
    }
    setForgotLoading(true)
    const result = await resetPassword(forgotEmail.trim())
    setForgotLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      setForgotSent(true)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">

        {/* ── FORGOT PASSWORD VIEW ── */}
        {showForgot ? (
          <div>
            <button
              onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail('') }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </button>

            {forgotSent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
                <p className="text-sm text-gray-500">
                  We've sent a password reset link to <span className="font-semibold text-gray-700">{forgotEmail}</span>.
                  Please check your inbox and follow the link.
                </p>
                <button
                  onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail('') }}
                  className="mt-4 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Enter the email address for your admin account and we'll send you a reset link.
                </p>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* ── SIGN IN VIEW ── */
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
                      <div className="mt-2 text-right">
                        <button
                          type="button"
                          onClick={() => setShowForgot(true)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
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
        )}
      </div>
    </div>
  )
}
