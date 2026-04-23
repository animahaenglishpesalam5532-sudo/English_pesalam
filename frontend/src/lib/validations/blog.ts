import * as Yup from 'yup'

export const blogSchema = Yup.object({
  title: Yup.string()
    .max(150, 'Title must be 150 characters or less')
    .required('Title is required'),
  slug: Yup.string()
    .max(150, 'Slug must be 150 characters or less')
    .required('Slug is required'),
  content: Yup.string()
    .min(20, 'Content must be at least 20 characters long')
    .required('Content is required'),
  author_id: Yup.string()
    .required('Please select an author'),
  status: Yup.string()
    .oneOf(['draft', 'published'], 'Invalid status')
    .required('Status is required'),
  featured_image: Yup.string()
    .url('Must be a valid URL')
    .nullable(),
  is_featured: Yup.boolean().default(false),
})
