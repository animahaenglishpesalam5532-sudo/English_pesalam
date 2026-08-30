'use client'

import React from 'react'
import { Check, CheckCheck, Clock, AlertTriangle } from 'lucide-react'
import { mediaLabel } from '@/lib/whatsapp/preview'
import { MediaMessage, type PlayableKind } from './MediaMessage'
import type { ThreadMessage } from '@/app/actions/whatsappInbox'

/** Media is stored as metadata only for now, so the body may be empty. */
const TEXT_TYPES = new Set(['text', 'template', 'interactive', 'button'])

/** Rendered inline via the media proxy; other types keep the text label. */
const PLAYABLE = new Set(['audio', 'image'])

const ORIGIN_CHIP: Record<string, string> = {
  broadcast: 'Campaign',
  auto_reply: 'Auto-reply',
}

function StatusIcon({ status }: { status: string | null }) {
  if (status === 'read') return <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
  if (status === 'delivered') return <CheckCheck className="h-3.5 w-3.5 text-gray-400" />
  if (status === 'sent') return <Check className="h-3.5 w-3.5 text-gray-400" />
  if (status === 'failed') return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
  return <Clock className="h-3.5 w-3.5 text-gray-300" />
}

export function MessageBubble({ message }: { message: ThreadMessage }) {
  const outbound = message?.direction === 'outbound'
  const chip = ORIGIN_CHIP[message?.origin]
  // Playable media gets the real thing; the label would only repeat itself.
  const kind = PLAYABLE.has(message?.type) ? (message?.type as PlayableKind) : null
  const mediaId = kind ? message?.mediaId : null
  const placeholder =
    TEXT_TYPES.has(message?.type) || mediaId ? '' : mediaLabel(message?.type)

  const time = new Date(message?.sentAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex ${outbound ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-xl px-3 py-2 shadow-sm sm:max-w-[70%] ${
          outbound ? 'bg-emerald-50' : 'bg-white'
        }`}
      >
        {chip && (
          <span className="mb-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            {chip}
            {message?.templateName ? ` · ${message.templateName}` : ''}
          </span>
        )}

        {placeholder && (
          <p className="text-xs font-semibold text-gray-500">
            {placeholder}
            {message?.mediaFilename ? ` ${message.mediaFilename}` : ''}
          </p>
        )}

        {mediaId && kind && <MediaMessage mediaId={mediaId} kind={kind} />}

        {message?.body && (
          <p className="whitespace-pre-wrap break-words text-sm text-gray-800">{message.body}</p>
        )}

        {message?.error && (
          <p className="mt-1 text-[11px] font-medium text-red-600">{message.error}</p>
        )}

        <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-gray-400">
          {outbound && message?.sentByName && <span>{message.sentByName}</span>}
          <span>{time}</span>
          {outbound && <StatusIcon status={message?.status ?? null} />}
        </div>
      </div>
    </div>
  )
}
