import { Suspense } from 'react'
import { BlogGrid } from '@/components/BlogGrid'
import { createStaticClient } from '@/lib/supabase/static'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page: pageParam } = await params
  const page = parseInt(pageParam, 10)
  return {
    title: `English Pesalam Blog - Page ${Number.isNaN(page) ? '' : page}`.trim(),
    description:
      'Practical English lessons, grammar tips, and spoken-English guides explained simply in Tamil.',
    alternates: { canonical: `/blogs/p/${pageParam}` },
  }
}

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { count } = await supabase
    .from('blogs')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')
    .eq('is_featured', false)

  if (!count) return []

  const itemsPerPage = 9
  const totalPages = Math.ceil(count / itemsPerPage)

  // Pre-render the first 5 pages of blogs
  const pagesToPrerender = Math.min(totalPages, 5)
  const params = []

  for (let i = 2; i <= pagesToPrerender; i++) {
    params.push({ page: i.toString() })
  }

  return params
}

export default async function PaginatedBlogsPage({
  params,
}: {
  params: Promise<{ page: string }>
}) {
  const { page: pageParam } = await params
  const page = parseInt(pageParam, 10);

  if (isNaN(page) || page < 2) {
    notFound()
  }

  return (
    <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 mt-16 text-gray-900">
      <div className="max-w-7xl mx-auto flex flex-col space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            English Pesalam Blog
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500">
            Learn English step-by-step with practical tips, lessons, and Tamil explanations.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 rounded-xl"></div>}>
            <BlogGrid page={page} />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
