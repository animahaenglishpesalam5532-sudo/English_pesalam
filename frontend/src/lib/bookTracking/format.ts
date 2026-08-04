import type { TrackedBook } from '@/app/actions/bookTracking'

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** "Grammar Basics × 2, Spoken English" — the books on a delivery record. */
export function booksLabel(items: TrackedBook[]): string {
  if (!items?.length) return '—'
  return items.map((i) => (i.qty > 1 ? `${i.title} × ${i.qty}` : i.title)).join(', ')
}
