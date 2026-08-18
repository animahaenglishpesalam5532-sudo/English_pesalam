'use client'

import React from 'react'
import { ExternalLink } from 'lucide-react'
import {
  fillPlaceholders,
  findComponent,
  headerFormat,
  type TemplateVariables,
  type WhatsAppTemplate,
} from '@/lib/whatsapp/templates'

interface Props {
  template: WhatsAppTemplate
  variables: TemplateVariables
}

/** Chat-bubble rendering of the template with the entered values filled in. */
export function TemplatePreview({ template, variables }: Props) {
  const format = headerFormat(template)
  const header = findComponent(template, 'HEADER')
  const body = findComponent(template, 'BODY')
  const footer = findComponent(template, 'FOOTER')
  const buttons = findComponent(template, 'BUTTONS')?.buttons ?? []

  return (
    <div className="rounded-lg bg-[#e5ddd5] p-4">
      <div className="max-w-sm rounded-lg bg-white px-3 py-2 shadow-sm">
        {format === 'TEXT' && header?.text && (
          <p className="text-sm font-bold text-gray-900">
            {fillPlaceholders(header.text, variables?.header ?? [])}
          </p>
        )}

        {format && format !== 'TEXT' && (
          <div className="mb-2 flex h-24 items-center justify-center rounded bg-gray-100 text-xs font-medium uppercase tracking-wider text-gray-400">
            {format}
          </div>
        )}

        <p className="whitespace-pre-wrap text-sm text-gray-800">
          {fillPlaceholders(body?.text, variables?.body ?? [])}
        </p>

        {footer?.text && <p className="mt-2 text-xs text-gray-400">{footer.text}</p>}

        {buttons.length > 0 && (
          <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
            {buttons.map((b, i) => (
              <div
                key={`${b.text}-${i}`}
                className="flex items-center justify-center gap-1.5 py-1 text-sm font-medium text-[#00a5f4]"
              >
                {b.type?.toUpperCase() === 'URL' && <ExternalLink className="h-3.5 w-3.5" />}
                {b.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
