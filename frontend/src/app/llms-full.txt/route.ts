import { createStaticClient } from '@/lib/supabase/static'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS, absoluteUrl } from '@/lib/seo'

// Rebuild on the same cadence as the content it lists.
export const revalidate = 3600

interface BlogRow {
  slug: string
  title: string
  meta_description: string | null
  content: string | null
  created_at: string | null
  updated_at: string | null
}

/** Convert stored blog HTML into readable plain text for LLM consumption. */
function htmlToText(html: string): string {
  return (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/(td|th)>/gi, '\t')
    .replace(/<\/(p|div|section|article|h[1-6]|li|ul|ol|tr|table|blockquote)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function GET() {
  let blogs: BlogRow[] = []
  try {
    const supabase = createStaticClient()
    const { data } = await supabase
      ?.from('blogs')
      ?.select('slug, title, meta_description, content, created_at, updated_at')
      ?.eq('status', 'published')
      ?.order('created_at', { ascending: false })
    blogs = (data as BlogRow[]) ?? []
  } catch {
    // If the DB is unreachable, still emit the core sections below.
  }

  const header = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

English Pesalam is a platform that helps Tamil speakers learn spoken English confidently. It offers simple Tamil explanations, daily-use English sentences, grammar patterns, vocabulary with Tamil meaning, pronunciation practice, quizzes, downloadable PDF and PPT study materials, and online classes.

Website: ${SITE_URL}

Topics: ${SITE_KEYWORDS?.join(', ')}.

## Sections

- Home (${absoluteUrl('/')}): Learn spoken English in Tamil — lessons, study materials and online classes.
- Blog (${absoluteUrl('/blogs')}): Articles explaining English words, grammar and sentences with Tamil meaning.
- PDF Guides (${absoluteUrl('/pdfs')}): Downloadable PDF guides for quick reference and deep learning on any device.
- PPT Study Guides (${absoluteUrl('/ppts')}): Visual slides, summaries and structured learning guides for fast retention.
- Quizzes (${absoluteUrl('/quiz')}): Grammar, vocabulary and sentence-structure quizzes with instant scoring and analysis.
- Video Courses (${absoluteUrl('/video-courses')}): Structured video modules with practical exercises and lifetime access.
- About (${absoluteUrl('/about')}): About English Pesalam and our mission to make English learning simple and practical.
`

  const posts = blogs
    ?.map((b) => {
      const url = absoluteUrl(`/blogs/${b?.slug}`)
      const date = (b?.updated_at ?? b?.created_at ?? '').slice(0, 10)
      const text = htmlToText(b?.content ?? '')
      const summary = b?.meta_description?.trim()
      return [
        `## ${b?.title}`,
        ``,
        `URL: ${url}`,
        date ? `Last updated: ${date}` : ``,
        summary ? `Summary: ${summary}` : ``,
        ``,
        text || '(No content.)',
      ]
        ?.filter((line) => line !== '')
        ?.join('\n')
    })
    ?.join('\n\n---\n\n')

  const body = `${header}\n# Blog Posts\n\n${posts || '(No published posts yet.)'}\n`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
