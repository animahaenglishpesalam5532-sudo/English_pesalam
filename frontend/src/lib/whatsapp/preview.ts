// One-line summaries of a message, used for the conversation list and as the
// stored body of anything that is not plain text.
//
// Media itself is not downloaded yet, so an image arrives as "[Photo]" plus
// whatever caption the customer typed.

const TYPE_LABEL: Record<string, string> = {
  image: 'Photo',
  video: 'Video',
  audio: 'Voice message',
  document: 'Document',
  sticker: 'Sticker',
  location: 'Location',
  contacts: 'Contact',
  reaction: 'Reaction',
  interactive: 'Card',
  button: 'Button reply',
  template: 'Template',
  order: 'Order',
  system: 'System message',
  unsupported: 'Unsupported message',
}

/** `[Photo]`, `[Document]`, or `[Reaction]` — never empty. */
export function mediaLabel(type: string | null | undefined): string {
  return `[${TYPE_LABEL[type ?? ''] ?? 'Message'}]`
}

export interface PreviewableMessage {
  type?: string | null
  body?: string | null
  media_filename?: string | null
}

const MAX_PREVIEW = 140

/**
 * `Sounds good!` for text, `[Photo] on page 12` for a captioned image,
 * `[Document] price-list.pdf` when there is no caption but there is a filename.
 */
export function previewForMessage(message: PreviewableMessage): string {
  const type = message?.type ?? 'text'
  const body = message?.body?.trim() ?? ''

  if (type === 'text') return truncate(body)

  const label = mediaLabel(type)
  const detail = body || message?.media_filename?.trim() || ''
  return truncate(detail ? `${label} ${detail}` : label)
}

function truncate(value: string): string {
  if (value.length <= MAX_PREVIEW) return value
  return `${value.slice(0, MAX_PREVIEW - 1)}…`
}
