import { createStaticClient } from '@/lib/supabase/static'
import { absoluteUrl } from '@/lib/seo'
import { htmlToText } from '@/lib/blogContent'

// Rebuild on the same cadence as the blog pages.
export const revalidate = 3600

interface BlogRow {
  slug: string
  title: string
  meta_description: string | null
  content: string | null
  created_at: string | null
  updated_at: string | null
  authors: { name: string | null } | { name: string | null }[] | null
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createStaticClient()
  const { data } = await supabase
    ?.from('blogs')
    ?.select('slug, title, meta_description, content, created_at, updated_at, authors(name)')
    ?.eq('slug', slug)
    ?.eq('status', 'published')
    ?.single()

  const blog = data as BlogRow | null

  if (!blog) {
    return new Response('# Not found\n\nThis blog post does not exist.\n', {
      status: 404,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    })
  }

  const author = Array.isArray(blog?.authors) ? blog?.authors?.[0] : blog?.authors
  const date = (blog?.updated_at ?? blog?.created_at ?? '')?.slice(0, 10)
  const summary = blog?.meta_description?.trim()

  const body = [
    `# ${blog?.title}`,
    ``,
    `URL: ${absoluteUrl(`/blogs/${blog?.slug}`)}`,
    author?.name ? `Author: ${author.name}` : ``,
    date ? `Last updated: ${date}` : ``,
    summary ? `\n> ${summary}` : ``,
    ``,
    htmlToText(blog?.content ?? '') || '(No content.)',
    ``,
  ]
    ?.filter((line) => line !== '')
    ?.join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
