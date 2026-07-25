import { createStaticClient } from '@/lib/supabase/static'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, absoluteUrl } from '@/lib/seo'

// Rebuild on the same cadence as the content it lists.
export const revalidate = 3600

interface BlogRow {
  slug: string
  title: string
  meta_description: string | null
}

export async function GET() {
  let blogs: BlogRow[] = []
  try {
    const supabase = createStaticClient()
    const { data } = await supabase
      ?.from('blogs')
      ?.select('slug, title, meta_description')
      ?.eq('status', 'published')
      ?.order('created_at', { ascending: false })
    blogs = (data as BlogRow[]) ?? []
  } catch {
    // If the DB is unreachable, still emit the core sections below.
  }

  const blogLines = blogs
    ?.map((b) => {
      const desc = b?.meta_description?.trim()
      return `- [${b?.title}](${absoluteUrl(`/blogs/${b.slug}`)})${desc ? `: ${desc}` : ''}`
    })
    ?.join('\n')

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

English Pesalam helps Tamil speakers learn spoken English confidently through simple Tamil explanations, daily-use sentences, grammar patterns, vocabulary, pronunciation practice, quizzes, downloadable PDF/PPT study materials and online classes.

## Main Pages

- [Home](${absoluteUrl('/')}): Learn spoken English in Tamil — lessons, study materials and online classes.
- [Blog](${absoluteUrl('/blogs')}): Articles explaining English words, grammar and sentences with Tamil meaning.
- [PDF Guides](${absoluteUrl('/pdfs')}): Downloadable PDF guides for quick reference and deep learning on any device.
- [PPT Study Guides](${absoluteUrl('/ppts')}): Visual slides, summaries and structured learning guides for fast retention.
- [Quizzes](${absoluteUrl('/quiz')}): Grammar, vocabulary and sentence-structure quizzes with instant scoring.
- [Video Courses](${absoluteUrl('/video-courses')}): Structured video modules with practical exercises and lifetime access.
- [About](${absoluteUrl('/about')}): About English Pesalam and our mission to make English learning simple.

## Blog Posts

${blogLines || '- (No published posts yet.)'}

## Optional

- [Full content for LLMs](${absoluteUrl('/llms-full.txt')}): Complete text of the site and all blog posts.

## Contact

- Website: ${SITE_URL}
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
