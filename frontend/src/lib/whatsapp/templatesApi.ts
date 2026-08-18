// Reads the message template catalogue from the Meta Graph API.
// Server-only — never import this from a client component, it uses the token.

import { whatsappConfig } from './config'
import type { TemplateComponent, WhatsAppTemplate } from './templates'

const TEMPLATE_FIELDS = 'id,name,language,status,category,components'

/**
 * Every message template on the WhatsApp Business Account, following Meta's
 * cursor pagination.
 */
export async function fetchTemplates(): Promise<{
  templates: WhatsAppTemplate[]
  error?: string
}> {
  const { accessToken, wabaId, graphApiVersion } = whatsappConfig

  if (!accessToken || !wabaId) {
    return { templates: [], error: 'WHATSAPP_WABA_ID / WHATSAPP_ACCESS_TOKEN are not configured' }
  }

  const templates: WhatsAppTemplate[] = []
  let url: string | undefined =
    `https://graph.facebook.com/${graphApiVersion}/${wabaId}/message_templates` +
    `?fields=${TEMPLATE_FIELDS}&limit=100`

  try {
    // Bounded so a broken paging cursor can never loop forever.
    for (let page = 0; page < 10 && url; page++) {
      const res: Response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      })
      const json = await res.json().catch(() => null)

      if (!res.ok) {
        return { templates, error: json?.error?.message ?? `HTTP ${res.status}` }
      }

      for (const item of json?.data ?? []) {
        templates.push({
          id: String(item?.id ?? `${item?.name}-${item?.language}`),
          name: item?.name ?? '',
          language: item?.language ?? '',
          status: item?.status ?? '',
          category: item?.category ?? '',
          components: (item?.components ?? []) as TemplateComponent[],
        })
      }

      url = json?.paging?.next
    }
  } catch (err) {
    return { templates, error: err instanceof Error ? err.message : 'Unknown error' }
  }

  return { templates }
}
