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

    return [...staticRoutes, ...blogRoutes, ...pageRoutes]
  } catch {
    // If the DB is unreachable at build time, still emit the static routes.
    return staticRoutes
  }
}
