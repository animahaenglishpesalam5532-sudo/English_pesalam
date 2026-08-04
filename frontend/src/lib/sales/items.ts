/** Anything with a title and an optional quantity — an interaction's items. */
export interface LabelledItem {
  title: string
  qty?: number
}

/**
 * Product list with the quantity shown when more than one was bought, e.g.
 * "Book One × 2, Book Two × 3". Used everywhere sales items are displayed so
 * quantities never get dropped in one view but shown in another.
 */
export function itemsText(items?: LabelledItem[], empty = ''): string {
  const label = (items ?? [])
    ?.map((i) => (i?.qty && i.qty > 1 ? `${i.title} × ${i.qty}` : i?.title))
    ?.join(', ')
  return label || empty
}
