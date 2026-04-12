'use client'

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'

const JoditEditor = dynamic(() => import('jodit-react'), { 
  ssr: false, 
  loading: () => <div className="min-h-[400px] bg-gray-50 flex items-center justify-center text-sm text-gray-500 animate-pulse">Loading Rich Text Editor...</div> 
})

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const config = useMemo(() => ({
    readonly: false,
    minHeight: 400,
    uploader: {
      insertImageAsBase64URI: true
    },
    image: {
      openOnDblClick: true,
      editSize: true,
      useImageEditor: true
    },
    toolbarAdaptive: false,
    safeHTML: false,
    iframe: true,
    disablePlugins: 'clean-html'
  }), [])

  return (
    <div className="bg-white">
      <JoditEditor
        value={value}
        config={config}
        onBlur={(newContent) => onChange(newContent)}
        onChange={(newContent) => onChange(newContent)}
      />
    </div>
  )
}
