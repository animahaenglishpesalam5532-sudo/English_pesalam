import type { Category, EntryProducts } from '@/app/actions/sales'

export interface ProductOption {
  id: string
  label: string
}

/** Products belonging to the selected categories, for item-level filters. */
export function productOptions(products: EntryProducts, cats: Category[]): ProductOption[] {
  const out: ProductOption[] = []
  if (cats.includes('book')) products?.books?.forEach((b) => out.push({ id: b.id, label: b.title }))
  if (cats.includes('pdf_ppt')) {
    products?.pdfs?.forEach((p) => out.push({ id: p.id, label: `PDF · ${p.title}` }))
    products?.ppts?.forEach((p) => out.push({ id: p.id, label: `PPT · ${p.title}` }))
  }
  if (cats.includes('video_course')) {
    products?.videoCourses?.forEach((v) => out.push({ id: v.id, label: v.title }))
  }
  return out
}
