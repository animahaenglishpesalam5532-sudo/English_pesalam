import type { MetadataRoute } from 'next'
import { createStaticClient } from '@/lib/supabase/static'
import { absoluteUrl } from '@/lib/seo'

// Rebuild the sitemap on the same cadence as the pages it lists.
export const revalidate = 3600

const BLOGS_PER_PAGE = 9

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/blogs'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/pdfs'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/ppts'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/online-classes'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/quiz'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ]

  try {
    const supabase = createStaticClient()
    const { data: blogs, count } = await supabase
      .from('blogs')
      .select('slug, updated_at, created_at', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    const blogRoutes: MetadataRoute.Sitemap = (blogs ?? []).map((b) => ({
      url: absoluteUrl(`/blogs/${b.slug}`),
      lastModified: new Date(b.updated_at ?? b.created_at ?? now),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    // Paginated blog list pages: /blogs/p/2, /blogs/p/3, ...
    const totalPages = Math.ceil((count ?? 0) / BLOGS_PER_PAGE)
    const pageRoutes: MetadataRoute.Sitemap = []
    for (let p = 2; p <= totalPages; p++) {
      pageRoutes.push({
        url: absoluteUrl(`/blogs/p/${p}`),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.5,
      })
    }

    // Individual quiz pages (/quiz/{id}) are stored as a JSON settings row.
    let quizRoutes: MetadataRoute.Sitemap = []
    try {
      const { data: quizSetting } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'quizzes')
        .single()

      if (quizSetting?.value) {
        const quizzes = JSON.parse(quizSetting.value) as Array<{ id: string; createdAt?: string }>
        quizRoutes = quizzes
          .filter((q) => q?.id)
          .map((q) => ({
            url: absoluteUrl(`/quiz/${q.id}`),
            lastModified: new Date(q.createdAt ?? now),
            changeFrequency: 'weekly',
            priority: 0.6,
          }))
      }
    } catch {
      // Ignore malformed/missing quiz data; the /quiz list route still ships.
    }

    return [...staticRoutes, ...blogRoutes, ...pageRoutes, ...quizRoutes]
  } catch {
    // If the DB is unreachable at build time, still emit the static routes.
    return staticRoutes
  }
}
