'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getConversations,
  getConversationThread,
  markConversationRead,
  sendChatText,
  sendChatTemplate,
  type ConversationSummary,
  type ThreadMessage,
} from '@/app/actions/whatsappInbox'
import type { TemplateVariables, WhatsAppTemplate } from '@/lib/whatsapp/templates'

export function useInbox(initialConversations: ConversationSummary[]) {
  const [conversations, setConversations] = useState(initialConversations)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loadingThread, setLoadingThread] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  /** Set when Meta (or our own check) says the 24h window has closed. */
  const [windowClosed, setWindowClosed] = useState(false)

  // Guards against a slow thread fetch landing after the user has clicked
  // another conversation.
  const requestRef = useRef(0)

  const selected = conversations.find((c) => c.id === selectedId) ?? null

  const loadConversations = useCallback(async (term: string) => {
    const res = await getConversations({ search: term })
    if (res.error) {
      setError(res.error)
      return
    }
    setError('')
    setConversations(res.rows)
  }, [])

  // Debounced search. The initial render is skipped so the server-rendered
  // first page is not immediately refetched.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const timer = setTimeout(() => loadConversations(search), 300)
    return () => clearTimeout(timer)
  }, [search, loadConversations])

  const loadThread = useCallback(async (conversationId: string) => {
    const token = ++requestRef.current
    setLoadingThread(true)
    const res = await getConversationThread({ conversationId })
    if (token !== requestRef.current) return
    setLoadingThread(false)

    if (res.error || !res.thread) {
      setError(res.error ?? 'Could not load this conversation')
      return
    }
    setError('')
    setMessages(res.thread.messages)
    setHasMore(res.thread.hasMore)
    // Keep the header's window countdown honest even if the list is stale.
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? res.thread!.conversation : c))
    )
  }, [])

  const select = useCallback(
    async (conversationId: string) => {
      setSelectedId(conversationId)
      setMessages([])
      setWindowClosed(false)
      await loadThread(conversationId)

      // Optimistic locally so the dot clears immediately; the server write is
      // idempotent so a failure just means it reappears on the next refresh.
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unread: false } : c))
      )
      await markConversationRead(conversationId)
    },
    [loadThread]
  )

  const back = useCallback(() => {
    setSelectedId(null)
    setMessages([])
  }, [])

  const loadOlder = useCallback(async () => {
    if (!selectedId || !messages.length) return
    const oldest = messages[0]
    const res = await getConversationThread({
      conversationId: selectedId,
      before: oldest.sentAt,
    })
    if (res.error || !res.thread) return
    setMessages((prev) => [...res.thread!.messages, ...prev])
    setHasMore(res.thread.hasMore)
  }, [selectedId, messages])

  /** The manual Refresh button: re-pulls the list and the open thread. */
  const refreshAll = useCallback(async () => {
    setRefreshing(true)
    await loadConversations(search)
    if (selectedId) await loadThread(selectedId)
    setRefreshing(false)
  }, [loadConversations, loadThread, search, selectedId])

  const send = useCallback(
    async (body: string) => {
      if (!selectedId || !body.trim()) return
      setSending(true)
      const res = await sendChatText({ conversationId: selectedId, body })
      setSending(false)

      if (res.windowClosed) setWindowClosed(true)
      if (res.error || !res.message) {
        setError(res.error ?? 'Send failed')
        return
      }
      setError('')
      setMessages((prev) => [...prev, res.message!])
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                lastMessageAt: res.message!.sentAt,
                lastMessagePreview: res.message!.body,
                lastDirection: 'outbound',
              }
            : c
        )
      )
    },
    [selectedId]
  )

  const sendTemplate = useCallback(
    async (template: WhatsAppTemplate, variables: TemplateVariables) => {
      if (!selectedId) return false
      setSending(true)
      const res = await sendChatTemplate({
        conversationId: selectedId,
        templateName: template.name,
        language: template.language,
        variables,
      })
      setSending(false)

      if (res.error || !res.message) {
        setError(res.error ?? 'Send failed')
        return false
      }
      setError('')
      setMessages((prev) => [...prev, res.message!])
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? {
                ...c,
                lastMessageAt: res.message!.sentAt,
                lastMessagePreview: res.message!.body,
                lastDirection: 'outbound',
              }
            : c
        )
      )
      return true
    },
    [selectedId]
  )

  return {
    conversations,
    selected,
    selectedId,
    search,
    setSearch,
    messages,
    hasMore,
    loadingThread,
    refreshing,
    sending,
    error,
    windowClosed,
    select,
    back,
    loadOlder,
    refreshAll,
    send,
    sendTemplate,
  }
}
