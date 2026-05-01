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
      minHeight: 653,
      maxHeight: 653,
      uploader: {
        insertImageAsBase64URI: false,
        url: '/api/upload',
        format: 'json',
        isSuccess: (resp: any) => resp.success,
        prepareData: function (this: any, data: FormData) {
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
        defaultHandlerError: function (this: any, resp: any) {
          setIsUploading(false);
          toast.error(resp.msg || 'Upload failed');
          if (this.j && this.j.e) {
            this.j.e.fire('errorPopap', [this.j.i18n ? this.j.i18n(resp.msg || 'Upload failed') : (resp.msg || 'Upload failed')]);
          }
        },
        error: function (this: any, e: any) {
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
      video: {
        parseUrlToVideoEmbed: function (url: string) {
          url = (url || '').trim();
          const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
          const match = url.match(regex);
          if (match && match[1]) {
            const videoId = match[1];
            return `<div style="text-align: center; margin: 15px 0; padding: 0 20px; width: 100%; box-sizing: border-box;"><iframe src="https://www.youtube.com/embed/${videoId}" style="width: 100%; aspect-ratio: 16/9; border-radius: 8px; border: none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p><br></p>`;
          }
          return url;
        }
      } as any,
      events: {
        beforeInsertNode: function (this: any, node: any) {
          if (!node) return;
          let url = '';
          if (node.nodeType === 3) { // TEXT_NODE
            url = node.nodeValue || '';
          } else if (node.tagName === 'A') {
            url = node.getAttribute('href') || node.innerText || '';
          } else if (node.tagName === 'IFRAME' || node.tagName === 'VIDEO') {
            url = node.getAttribute('src') || '';
          } else if (node.textContent) {
            // Check if the entire node is just the URL (e.g. wrapped in a SPAN)
            const text = node.textContent.trim();
            if (/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/.test(text)) {
              url = text;
            }
          }

          url = url.trim();
          if (url && /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url)) {
            const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
            const match = url.match(regex);
            if (match && match[1]) {
              const videoId = match[1];
              const doc = node.ownerDocument || document;
              
              const wrapper = doc.createElement('div');
              wrapper.style.textAlign = 'center';
              wrapper.style.margin = '15px 0';
              wrapper.style.padding = '0 20px';
              wrapper.style.width = '100%';
              wrapper.style.boxSizing = 'border-box';

              const iframe = doc.createElement('iframe');
              iframe.src = `https://www.youtube.com/embed/${videoId}`;
              iframe.style.width = '100%';
              iframe.style.aspectRatio = '16/9';
              iframe.style.borderRadius = '8px';
              iframe.style.border = 'none';
              iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
              iframe.allowFullscreen = true;

              wrapper.appendChild(iframe);
              
              this.s.insertNode(wrapper);
              
              const p = doc.createElement('p');
              p.appendChild(doc.createElement('br'));
              if (wrapper.parentNode) {
                wrapper.parentNode.insertBefore(p, wrapper.nextSibling);
                setTimeout(() => {
                  if (this.s && typeof this.s.setCursorIn === 'function') {
                    this.s.setCursorIn(p);
                  }
                }, 50);
              }
              
              return false; // Prevent default Jodit insertion
            }
          }
        },
        afterInsertNode: function (this: any, node: any) {
          if (node && (node.tagName === 'IFRAME' || node.tagName === 'VIDEO' || node.nodeName === 'IFRAME' || node.nodeName === 'VIDEO')) {
            const doc = node.ownerDocument || document;
            let targetBlock = node;

            if (node.parentNode && node.parentNode.tagName === 'P') {
              node.parentNode.style.textAlign = 'center';
              node.parentNode.style.padding = '0 20px';
              node.parentNode.style.width = '100%';
              node.parentNode.style.boxSizing = 'border-box';
              targetBlock = node.parentNode;
              
              node.style.width = '100%';
              node.style.aspectRatio = '16/9';
              node.style.borderRadius = '8px';
            } else {
              const wrapper = doc.createElement('div');
              wrapper.style.textAlign = 'center';
              wrapper.style.margin = '15px 0';
              wrapper.style.padding = '0 20px';
              wrapper.style.width = '100%';
              wrapper.style.boxSizing = 'border-box';

              node.style.width = '100%';
              node.style.aspectRatio = '16/9';
              node.style.borderRadius = '8px';

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
