/* eslint-disable @next/next/no-img-element */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { User, ArrowLeft } from 'lucide-react'

export const dynamicParams = true; // allow on-demand generation for blogs not in top 9
export const revalidate = 3600; // ISR fallback

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase environment variables missing. Skipping static params generation.');
    return [];
  }
  
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  const { data: blogs } = await supabase
    .from('blogs')
    .select('slug')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(9)
    
  return blogs ? blogs.map((blog) => ({ slug: String(blog.slug) })) : []
}

// Generate metadata for SEO based on the blog data
export async function generateMetadata({ params }: { params: { slug: string } }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { title: 'English Pesalam' }
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data: blog } = await supabase
    .from('blogs')
    .select('title, content, meta_title, meta_description')
    .eq('slug', params.slug)
    .single()

  if (!blog) {
    return { title: 'Blog Not Found' }
  }

  // Use custom meta if provided, otherwise auto-generate from content
  const title = blog.meta_title?.trim()
    ? blog.meta_title
    : `${blog.title} | English Pesalam`

  const description = blog.meta_description?.trim()
    ? blog.meta_description
    : blog.content.replace(/<[^>]+>/g, '').substring(0, 160).trim() + '...'

  return { title, description }
}

export default async function SingleBlogPage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: blog } = await supabase
    .from('blogs')
    .select('*, authors(*)')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!blog) {
    notFound()
  }

  // Handle potential nested array mapping quirks on production query payloads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const author: any = Array.isArray(blog.authors) ? blog.authors[0] : blog.authors;

  return (
      <main className="flex-1 mt-14 bg-white" suppressHydrationWarning={true}>
        {/* Article Header */}
        <div className="bg-gray-50/50 pt-12 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <Link href="/blogs" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center text-sm transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blogs
              </Link>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
              {blog.title}
            </h1>

            <div className="flex items-center space-x-6 text-gray-500">
              <div className="flex items-center">
                {author?.profile_image ? (
                   <img src={author.profile_image} alt="" className="w-8 h-8 rounded-full mr-3 object-cover shadow-sm bg-gray-100" />
                ) : (
                  <div className="w-8 h-8 rounded-full mr-3 bg-blue-100 text-blue-600 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <span className="font-medium text-gray-900">{author?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center">
                <time dateTime={blog.created_at}>
                  {new Date(blog.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
              </div>
            </div>
          </div>
        </div>


        {/* Content Area */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 overflow-hidden">
          <article 
            className="prose prose-lg prose-blue max-w-full text-gray-800 break-words [overflow-wrap:anywhere] font-jakarta prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-img:rounded-2xl prose-img:shadow-md prose-img:border prose-img:border-gray-100 prose-img:mx-auto prose-img:my-[15px] [&_iframe]:my-[15px] [&_video]:my-[15px] [&_figure]:my-[15px]"
            dangerouslySetInnerHTML={{ __html: blog.content || '' }}
          />
          
          {/* Author Bio Section */}
          {author && (
            <div className="mt-16 pt-10 border-t border-gray-200">
              <div className="bg-gray-50 rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                {author.profile_image ? (
                  <img src={author.profile_image} alt={author.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 border-4 border-white shadow-sm">
                    <User className="w-8 h-8" />
                  </div>
                )}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-gray-900">{author.name}</h3>
                  {author.designation && (
                    <p className="text-blue-600 font-medium text-sm mt-1">{author.designation}</p>
                  )}
                  {author.bio && (
                    <p className="text-gray-600 mt-3">{author.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
  )
}

