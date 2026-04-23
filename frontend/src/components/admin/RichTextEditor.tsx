/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

const JoditEditor = dynamic(() => import('jodit-react'), { 
  ssr: false, 
  loading: () => <div className="min-h-[400px] bg-gray-50 flex items-center justify-center text-sm text-gray-500 animate-pulse">Loading Rich Text Editor...</div> 
})

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);

  const config = useMemo(() => {
    return {
      readonly: false,
      minHeight: 400,
      maxHeight: 650,
      uploader: {
        insertImageAsBase64URI: false,
        url: '/api/upload',
        format: 'json',
        isSuccess: (resp: any) => resp.success,
        prepareData: function(this: any, data: FormData) {
          setIsUploading(true);
          if (this.j && this.j.e) {
            this.j.e.fire('closeAllPopups');
          }
          return data;
        },
        process: (resp: any) => {
          setIsUploading(false);
          toast.success('Media uploaded successfully!');
          return {
            files: resp.data?.files || resp.files || [],
            path: resp.data?.path || resp.path || '',
            baseurl: resp.data?.baseurl || resp.baseurl || '',
            isImages: resp.data?.isImages || resp.isImages || [true],
            error: resp.error || resp.success === false ? 1 : 0,
            msg: resp.msg || ''
          };
        },
        defaultHandlerError: function(this: any, resp: any) {
          setIsUploading(false);
          toast.error(resp.msg || 'Upload failed');
          if (this.j && this.j.e) {
            this.j.e.fire('errorPopap', [this.j.i18n ? this.j.i18n(resp.msg || 'Upload failed') : (resp.msg || 'Upload failed')]);
          }
        },
        error: function(this: any, e: any) {
          setIsUploading(false);
          toast.error('Upload failed');
          if (this.j && this.j.e) {
            this.j.e.fire('errorPopap', [this.j.i18n ? this.j.i18n(e.message || 'Upload failed') : (e.message || 'Upload failed')]);
          }
        }
      },
      image: {
        openOnDblClick: true,
        editSize: true,
        useImageEditor: true
      },
      toolbarAdaptive: false,
      safeHTML: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: 'insert_as_html' as any,
      cleanHTML: {
        sandboxIframesInContent: false,
        denyTags: {
          script: true
        }
      } as any,
      events: {
        afterInsertNode: function(this: any, node: any) {
          if (node && (node.tagName === 'IFRAME' || node.tagName === 'VIDEO' || node.nodeName === 'IFRAME' || node.nodeName === 'VIDEO')) {
            const doc = node.ownerDocument || document;
            let targetBlock = node;

            // Instead of forcing display:block on an inline media tag (which breaks Selection offsets when inside a P tag),
            // safely center the parent container block.
            if (node.parentNode && node.parentNode.tagName === 'P') {
              node.parentNode.style.textAlign = 'center';
              targetBlock = node.parentNode;
            } else {
              const wrapper = doc.createElement('div');
              wrapper.style.textAlign = 'center';
              wrapper.style.margin = '15px 0';
              if (node.parentNode) {
                node.parentNode.insertBefore(wrapper, node);
                wrapper.appendChild(node);
                targetBlock = wrapper;
              }
            }
            
            if (targetBlock.parentNode) {
               const p = doc.createElement('p');
               p.appendChild(doc.createElement('br'));
               
               targetBlock.parentNode.insertBefore(p, targetBlock.nextSibling);
               
               if (this.s && typeof this.s.setCursorIn === 'function') {
                   setTimeout(() => {
                       this.s.setCursorIn(p);
                   }, 50);
               }
            }
          }
        }
      },
      removeButtons: ['source', 'spellcheck', 'speechRecognize', 'cut', 'copy', 'copyformat', 'brush', 'print', 'file', 'ai-assistant', 'ai-commands', 'aicommand', 'aiassistant', 'classSpan']
    }
  }, [])

  return (
    <div className="relative bg-white font-jakarta prose prose-lg prose-blue max-w-full prose-img:my-[15px] [&_iframe]:my-[15px] [&_video]:my-[15px] [&_figure]:my-[15px]">
      {isUploading && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-md border border-gray-200">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="mt-4 font-medium text-blue-600 animate-pulse">Uploading Media...</p>
        </div>
      )}
      <JoditEditor
        value={value}
        config={config}
        onBlur={(newContent) => onChange(newContent)}
        onChange={(newContent) => onChange(newContent)}
      />
    </div>
  )
}
