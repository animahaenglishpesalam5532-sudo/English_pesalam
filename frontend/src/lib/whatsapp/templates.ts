// Message template shapes and the pure helpers that turn a template + the
// admin's variable values into a preview or a Cloud API send payload.
// Safe to import from client components — the Graph API call lives in
// ./templatesApi, which is server-only.

export type TemplateComponentType = 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS'
export type HeaderFormat = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION'

export interface TemplateButton {
  type?: string
  text?: string
  url?: string
}

export interface TemplateComponent {
  type: TemplateComponentType
  format?: HeaderFormat
  text?: string
  buttons?: TemplateButton[]
}

export interface WhatsAppTemplate {
  id: string
  name: string
  language: string
  status: string
  category: string
  components: TemplateComponent[]
}

/** The variable values the admin filled in for the selected template. */
export interface TemplateVariables {
  /** Values for the {{n}} placeholders in a TEXT header. */
  header: string[]
  /** Values for the {{n}} placeholders in the body. */
  body: string[]
  /** Public https URL for an IMAGE / VIDEO / DOCUMENT header. */
  headerMediaUrl?: string
  /** Button position (as a string index) -> value for a dynamic URL suffix. */
  buttonUrls: Record<string, string>
}

export const EMPTY_VARIABLES: TemplateVariables = {
  header: [],
  body: [],
  headerMediaUrl: '',
  buttonUrls: {},
}

/** Highest {{n}} placeholder in the text, i.e. how many values it needs. */
export function placeholderCount(text?: string | null): number {
  if (!text) return 0
  let max = 0
  for (const match of text.matchAll(/\{\{\s*(\d+)\s*\}\}/g)) {
    max = Math.max(max, Number(match[1]))
  }
  return max
}

/** Substitutes {{1}}, {{2}}... with the given values for previews and logs. */
export function fillPlaceholders(text: string | undefined, values: string[]): string {
  if (!text) return ''
  return text.replace(/\{\{\s*(\d+)\s*\}\}/g, (whole, index) => {
    const value = values?.[Number(index) - 1]
    return value?.trim() ? value : whole
  })
}

export function findComponent(
  template: WhatsAppTemplate | null | undefined,
  type: TemplateComponentType
): TemplateComponent | undefined {
  return template?.components?.find((c) => c.type === type)
}

export function headerFormat(template: WhatsAppTemplate | null | undefined): HeaderFormat | null {
  const header = findComponent(template, 'HEADER')
  return header ? ((header.format ?? 'TEXT') as HeaderFormat) : null
}

/** Buttons whose URL ends in a {{1}} suffix, paired with their position. */
export function dynamicUrlButtons(
  template: WhatsAppTemplate | null | undefined
): { index: number; button: TemplateButton }[] {
  const buttons = findComponent(template, 'BUTTONS')?.buttons ?? []
  return buttons
    .map((button, index) => ({ index, button }))
    .filter(
      ({ button }) => button?.type?.toUpperCase() === 'URL' && placeholderCount(button?.url) > 0
    )
}

/** Body text with the admin's values filled in — what we store in the log. */
export function renderBodyPreview(
  template: WhatsAppTemplate | null | undefined,
  variables: TemplateVariables
): string {
  return fillPlaceholders(findComponent(template, 'BODY')?.text, variables?.body ?? [])
}

/** Human-readable list of the variables that still need a value. */
export function missingVariables(
  template: WhatsAppTemplate,
  variables: TemplateVariables
): string[] {
  const missing: string[] = []
  const format = headerFormat(template)

  if (format === 'TEXT') {
    const needed = placeholderCount(findComponent(template, 'HEADER')?.text)
    for (let i = 0; i < needed; i++) {
      if (!variables?.header?.[i]?.trim()) missing.push(`Header {{${i + 1}}}`)
    }
  } else if (format && format !== 'LOCATION' && !variables?.headerMediaUrl?.trim()) {
    missing.push(`${format.toLowerCase()} header URL`)
  }

  const bodyNeeded = placeholderCount(findComponent(template, 'BODY')?.text)
  for (let i = 0; i < bodyNeeded; i++) {
    if (!variables?.body?.[i]?.trim()) missing.push(`Body {{${i + 1}}}`)
  }

  for (const { index } of dynamicUrlButtons(template)) {
    if (!variables?.buttonUrls?.[String(index)]?.trim()) missing.push(`Button ${index + 1} URL value`)
  }

  return missing
}

/** Builds the `components` array the Cloud API expects for this template. */
export function buildTemplateComponents(
  template: WhatsAppTemplate,
  variables: TemplateVariables
): Record<string, unknown>[] {
  const components: Record<string, unknown>[] = []
  const format = headerFormat(template)

  if (format === 'TEXT') {
    const needed = placeholderCount(findComponent(template, 'HEADER')?.text)
    if (needed > 0) {
      components.push({
        type: 'header',
        parameters: Array.from({ length: needed }, (_, i) => ({
          type: 'text',
          text: variables?.header?.[i] ?? '',
        })),
      })
    }
  } else if (format === 'IMAGE' || format === 'VIDEO' || format === 'DOCUMENT') {
    const kind = format.toLowerCase()
    components.push({
      type: 'header',
      parameters: [{ type: kind, [kind]: { link: variables?.headerMediaUrl?.trim() } }],
    })
  }

  const bodyNeeded = placeholderCount(findComponent(template, 'BODY')?.text)
  if (bodyNeeded > 0) {
    components.push({
      type: 'body',
      parameters: Array.from({ length: bodyNeeded }, (_, i) => ({
        type: 'text',
        text: variables?.body?.[i] ?? '',
      })),
    })
  }

  for (const { index } of dynamicUrlButtons(template)) {
    components.push({
      type: 'button',
      sub_type: 'url',
      index: String(index),
      parameters: [{ type: 'text', text: variables?.buttonUrls?.[String(index)] ?? '' }],
    })
  }

  return components
}
