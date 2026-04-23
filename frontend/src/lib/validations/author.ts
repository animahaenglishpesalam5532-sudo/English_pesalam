import * as Yup from 'yup'

export const authorSchema = Yup.object({
  name: Yup.string()
    .max(50, 'Name must be 50 characters or less')
    .required('Name is required'),
  designation: Yup.string()
    .max(100, 'Designation must be 100 characters or less')
    .nullable(),
  bio: Yup.string()
    .max(500, 'Bio must be 500 characters or less')
    .nullable(),
  profile_image: Yup.string()
    .url('Must be a valid URL')
    .nullable(),
})
