/**
 * Convert stored blog HTML into readable plain-text / lightweight markdown
 * suitable for LLM consumption (llms.txt, per-page .md exports).
 */
export function htmlToText(html: string): string {
  return (html || '')
    ?.replace(/<script[\s\S]*?<\/script>/gi, '')
    ?.replace(/<style[\s\S]*?<\/style>/gi, '')
    ?.replace(/<\/(td|th)>/gi, '\t')
    ?.replace(/<\/(p|div|section|article|h[1-6]|li|ul|ol|tr|table|blockquote)>/gi, '\n')
    ?.replace(/<br\s*\/?>/gi, '\n')
    ?.replace(/<li[^>]*>/gi, '- ')
    ?.replace(/<[^>]+>/g, '')
    ?.replace(/&nbsp;/g, ' ')
    ?.replace(/&amp;/g, '&')
    ?.replace(/&lt;/g, '<')
    ?.replace(/&gt;/g, '>')
    ?.replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    ?.replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    ?.replace(/[ \t]+\n/g, '\n')
    ?.replace(/\n{3,}/g, '\n\n')
    ?.trim()
}
