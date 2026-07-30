import * as Yup from 'yup'

export const loginSchema = Yup.object({
  // Accepts either an email (admins) or a bare username (staff).
  email: Yup.string()
    .matches(/^([^@\s]+@[^@\s]+\.[^@\s]+|[a-zA-Z0-9._-]+)$/, 'Enter your email or username')
    .required('Email or username is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
})
