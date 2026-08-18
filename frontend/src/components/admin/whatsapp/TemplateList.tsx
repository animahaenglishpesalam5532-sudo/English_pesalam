'use client'

import React, { useMemo, useState } from 'react'
import { Check, Search } from 'lucide-react'
import { findComponent, type WhatsAppTemplate } from '@/lib/whatsapp/templates'
import { FILTER_INPUT } from './styles'

interface Props {
  templates: WhatsAppTemplate[]
  selected: WhatsAppTemplate | null
  onSelect: (template: WhatsAppTemplate) => void
}

/** Searchable list of approved templates — click one to select it. */
export function TemplateList({ templates, selected, onSelect }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return templates
    return templates?.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.category?.toLowerCase().includes(term) ||
        findComponent(t, 'BODY')?.text?.toLowerCase().includes(term)
    )
  }, [templates, query])

  return (
    <div>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className={`${FILTER_INPUT} pl-9`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search templates..."
        />
      </div>

      <div className="max-h-[420px] overflow-y-auto space-y-1.5 pr-1">
        {filtered?.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No templates match.</p>
        ) : (
          filtered?.map((t) => {
            const isSelected = selected?.name === t.name && selected?.language === t.language
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelect(t)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">{t.name}</span>
                  {isSelected && <Check className="w-4 h-4 shrink-0 text-blue-600" />}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {t.language}
                  </span>
                  {t.category && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      {t.category}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                  {findComponent(t, 'BODY')?.text ?? ''}
                </p>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
