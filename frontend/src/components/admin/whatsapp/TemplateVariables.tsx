'use client'

import React from 'react'
import {
  dynamicUrlButtons,
  findComponent,
  headerFormat,
  placeholderCount,
  type TemplateVariables as Variables,
  type WhatsAppTemplate,
} from '@/lib/whatsapp/templates'
import { INPUT, LABEL } from './styles'

interface Props {
  template: WhatsAppTemplate
  variables: Variables
  onChange: (variables: Variables) => void
}

/** Inputs for every {{n}} placeholder and media header the template declares. */
export function TemplateVariablesForm({ template, variables, onChange }: Props) {
  const format = headerFormat(template)
  const headerCount = format === 'TEXT' ? placeholderCount(findComponent(template, 'HEADER')?.text) : 0
  const bodyCount = placeholderCount(findComponent(template, 'BODY')?.text)
  const urlButtons = dynamicUrlButtons(template)
  const needsMedia = format === 'IMAGE' || format === 'VIDEO' || format === 'DOCUMENT'

  if (!headerCount && !bodyCount && !urlButtons.length && !needsMedia) return null

  const setAt = (key: 'header' | 'body', index: number, value: string) => {
    const next = [...(variables[key] ?? [])]
    next[index] = value
    onChange({ ...variables, [key]: next })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Variables</p>

      {needsMedia && (
        <div>
          <label className={LABEL}>{format} header URL</label>
          <input
            className={INPUT}
            value={variables.headerMediaUrl ?? ''}
            onChange={(e) => onChange({ ...variables, headerMediaUrl: e.target.value })}
            placeholder="https://... (publicly reachable)"
          />
        </div>
      )}

      {Array.from({ length: headerCount }, (_, i) => (
        <div key={`header-${i}`}>
          <label className={LABEL}>{`Header {{${i + 1}}}`}</label>
          <input
            className={INPUT}
            value={variables.header?.[i] ?? ''}
            onChange={(e) => setAt('header', i, e.target.value)}
          />
        </div>
      ))}

      {Array.from({ length: bodyCount }, (_, i) => (
        <div key={`body-${i}`}>
          <label className={LABEL}>{`Body {{${i + 1}}}`}</label>
          <input
            className={INPUT}
            value={variables.body?.[i] ?? ''}
            onChange={(e) => setAt('body', i, e.target.value)}
          />
        </div>
      ))}

      {urlButtons.map(({ index, button }) => (
        <div key={`button-${index}`}>
          <label className={LABEL}>{`Button "${button.text}" URL value`}</label>
          <input
            className={INPUT}
            value={variables.buttonUrls?.[String(index)] ?? ''}
            onChange={(e) =>
              onChange({
                ...variables,
                buttonUrls: { ...variables.buttonUrls, [String(index)]: e.target.value },
              })
            }
            placeholder={button.url ?? ''}
          />
        </div>
      ))}
    </div>
  )
}
