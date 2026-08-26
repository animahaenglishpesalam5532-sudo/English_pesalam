'use server'

// Server actions for the WhatsApp inbox.
//
// SECURITY: every export here runs on createAdminClient(), which uses the
// service role and bypasses RLS completely. requireInboxAccess() is therefore
// the *only* thing between a logged-in user and every customer conversation.
// A missing guard is not a small bug. Add it first in any new export.

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireInboxAccess } from '@/lib/auth/roles'
import { recordMessages } from '@/lib/whatsapp/conversations'
import { isWindowOpen } from '@/lib/whatsapp/window'
import { sendText, sendTemplate } from '@/lib/whatsapp/client'
import { fetchTemplates } from '@/lib/whatsapp/templatesApi'
import { resolveHeaderMediaId } from '@/lib/whatsapp/media'
import {
  buildTemplateComponents,
  missingVariables,
  renderBodyPreview,
  EMPTY_VARIABLES,
  type TemplateVariables,
  type WhatsAppTemplate,
} from '@/lib/whatsapp/templates'

/** One row in the conversation list. */
export interface ConversationSummary {
  id: string
  phone: string
  customerId: string | null
  customerName: string | null
  profileName: string | null
  lastMessageAt: string
  lastInboundAt: string | null
  lastMessagePreview: string | null
  lastDirection: string | null
  unread: boolean
}

/** One bubble in the thread. */
export interface ThreadMessage {
  id: string
  direction: 'inbound' | 'outbound'
  origin: string
  messageId: string | null
  type: string
  body: string | null
  mediaFilename: string | null
  status: string | null
  error: string | null
  templateName: string | null
  sentAt: string
  sentByName: string | null
}

export interface ConversationThread {
  conversation: ConversationSummary
  messages: ThreadMessage[]
  hasMore: boolean
}

const LIST_PAGE_SIZE = 30
const THREAD_PAGE_SIZE = 40

/** Derived, never stored — see the comment in migration 012. */
function isUnread(lastInboundAt: string | null, lastReadAt: string | null): boolean {
  if (!lastInboundAt) return false
  if (!lastReadAt) return true
  return new Date(lastInboundAt).getTime() > new Date(lastReadAt).getTime()
}

interface ConversationRow {
  id: string
  phone: string
  customer_id: string | null
  profile_name: string | null
  last_message_at: string
  last_inbound_at: string | null
  last_read_at: string | null
  last_message_preview: string | null
  last_direction: string | null
  customers?: { name: string | null } | { name: string | null }[] | null
}

function toSummary(row: ConversationRow): ConversationSummary {
  // PostgREST types an embedded to-one relation as an array, so unwrap it.
  const customer = Array.isArray(row.customers) ? row.customers[0] : row.customers
  return {
    id: row.id,
    phone: row.phone,
    customerId: row.customer_id,
    customerName: customer?.name ?? null,
    profileName: row.profile_name,
    lastMessageAt: row.last_message_at,
    lastInboundAt: row.last_inbound_at,
    lastMessagePreview: row.last_message_preview,
    lastDirection: row.last_direction,
    unread: isUnread(row.last_inbound_at, row.last_read_at),
  }
}

const CONVERSATION_COLUMNS =
  'id, phone, customer_id, profile_name, last_message_at, last_inbound_at, last_read_at, last_message_preview, last_direction, customers(name)'

export interface ConversationListResult {
  rows: ConversationSummary[]
  hasMore: boolean
  error?: string
}

/**
 * The inbox list. Only numbers that have actually replied appear: a broadcast
 * creates a conversation row too, so without the `last_inbound_at` filter every
 * silent recipient would show up as an empty chat.
 */
export async function getConversations(input?: {
  search?: string
  page?: number
}): Promise<ConversationListResult> {
  try {
    await requireInboxAccess()
  } catch {
    return { rows: [], hasMore: false, error: 'Not authorized' }
  }

  const page = Math.max(0, input?.page ?? 0)
  const from = page * LIST_PAGE_SIZE
  const supabase = createAdminClient()

  let query = supabase
    .from('whatsapp_conversations')
    .select(CONVERSATION_COLUMNS)
    .not('last_inbound_at', 'is', null)
    .order('last_message_at', { ascending: false })
    // One extra row is the cheapest way to know whether a next page exists.
    .range(from, from + LIST_PAGE_SIZE)

  const search = input?.search?.trim()
  if (search) {
    const digits = search.replace(/\D/g, '')
    query = digits
      ? query.or(`phone.ilike.%${digits}%,profile_name.ilike.%${search}%`)
      : query.ilike('profile_name', `%${search}%`)
  }

  const { data, error } = await query
  if (error) {
    console.error('[whatsapp-inbox] list failed', error.message)
    return { rows: [], hasMore: false, error: error.message }
  }

  const rows = (data ?? []) as unknown as ConversationRow[]
  return {
    rows: rows.slice(0, LIST_PAGE_SIZE).map(toSummary),
    hasMore: rows.length > LIST_PAGE_SIZE,
  }
}

interface ThreadRow {
  id: string
  direction: 'inbound' | 'outbound'
  origin: string
  message_id: string | null
  type: string
  body: string | null
  media_filename: string | null
  status: string | null
  error: string | null
  template_name: string | null
  sent_at: string
  profiles?: { full_name: string | null } | { full_name: string | null }[] | null
}

function toThreadMessage(row: ThreadRow): ThreadMessage {
  const sender = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
  return {
    id: row.id,
    direction: row.direction,
    origin: row.origin,
    messageId: row.message_id,
    type: row.type,
    body: row.body,
    mediaFilename: row.media_filename,
    status: row.status,
    error: row.error,
    templateName: row.template_name,
    sentAt: row.sent_at,
    sentByName: sender?.full_name ?? null,
  }
}

/**
 * One thread, newest first from the database and reversed for display.
 * `before` keysets on sent_at for "load older".
 */
export async function getConversationThread(input: {
  conversationId: string
  before?: string
}): Promise<{ thread?: ConversationThread; error?: string }> {
  try {
    await requireInboxAccess()
  } catch {
    return { error: 'Not authorized' }
  }

  if (!input?.conversationId) return { error: 'No conversation selected' }

  const supabase = createAdminClient()
  const { data: conversation } = await supabase
    .from('whatsapp_conversations')
    .select(CONVERSATION_COLUMNS)
    .eq('id', input.conversationId)
    .maybeSingle()

  if (!conversation) return { error: 'Conversation not found' }

  let query = supabase
    .from('whatsapp_conversation_messages')
    .select(
      'id, direction, origin, message_id, type, body, media_filename, status, error, template_name, sent_at, profiles:sent_by(full_name)'
    )
    .eq('conversation_id', input.conversationId)
    .order('sent_at', { ascending: false })
    .order('id', { ascending: false })
    .range(0, THREAD_PAGE_SIZE)

  if (input?.before) query = query.lt('sent_at', input.before)

  const { data, error } = await query
  if (error) {
    console.error('[whatsapp-inbox] thread failed', error.message)
    return { error: error.message }
  }

  const rows = (data ?? []) as unknown as ThreadRow[]
  return {
    thread: {
      conversation: toSummary(conversation as unknown as ConversationRow),
      messages: rows.slice(0, THREAD_PAGE_SIZE).map(toThreadMessage).reverse(),
      hasMore: rows.length > THREAD_PAGE_SIZE,
    },
  }
}

/** Clears the unread dot. Idempotent — safe to call on every thread open. */
export async function markConversationRead(
  conversationId: string
): Promise<{ ok: boolean }> {
  try {
    await requireInboxAccess()
  } catch {
    return { ok: false }
  }
  if (!conversationId) return { ok: false }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('whatsapp_conversations')
    .update({ last_read_at: new Date().toISOString() })
    .eq('id', conversationId)

  return { ok: !error }
}

export interface SendChatResult {
  message?: ThreadMessage
  error?: string
  /** True when the send failed because the 24h window has closed. */
  windowClosed?: boolean
}

/**
 * A free-form reply. Takes a conversationId rather than a phone number on
 * purpose: with a phone parameter any inbox user could message an arbitrary
 * number, bypassing the "must have replied to us first" rule entirely.
 */
export async function sendChatText(input: {
  conversationId: string
  body: string
}): Promise<SendChatResult> {
  let user
  try {
    user = await requireInboxAccess()
  } catch {
    return { error: 'Not authorized' }
  }

  const body = input?.body?.trim()
  if (!body) return { error: 'Type a message first' }
  if (!input?.conversationId) return { error: 'No conversation selected' }

  const supabase = createAdminClient()
  const { data: conversation } = await supabase
    .from('whatsapp_conversations')
    .select('id, phone, last_inbound_at')
    .eq('id', input.conversationId)
    .maybeSingle()

  if (!conversation) return { error: 'Conversation not found' }

  // Re-checked here, not trusted from the client: the page is refreshed
  // manually, so its copy of last_inbound_at can be hours out of date.
  if (!isWindowOpen(conversation.last_inbound_at)) {
    return {
      error: 'The 24-hour reply window has closed. Send a template instead.',
      windowClosed: true,
    }
  }

  const result = await sendText(conversation.phone, body)
  const sentAt = new Date().toISOString()

  await recordMessages([
    {
      phone: conversation.phone,
      direction: 'outbound',
      origin: 'chat',
      messageId: result?.messageId ?? null,
      type: 'text',
      body,
      status: result?.ok ? 'sent' : 'failed',
      error: result?.ok ? null : (result?.error ?? 'Send failed'),
      sentBy: user.id,
      sentAt,
    },
  ])

  if (!result?.ok) {
    // 131047 means Meta disagrees with our view of the window — surface it and
    // let the UI fall back to the template picker rather than guessing.
    const closed = /131047/.test(result?.error ?? '')
    return { error: result?.error ?? 'Send failed', windowClosed: closed }
  }

  revalidatePath('/admin/whatsapp/inbox')

  return {
    message: {
      id: result.messageId ?? sentAt,
      direction: 'outbound',
      origin: 'chat',
      messageId: result.messageId ?? null,
      type: 'text',
      body,
      mediaFilename: null,
      status: 'sent',
      error: null,
      templateName: null,
      sentAt,
      sentByName: user.fullName,
    },
  }
}

/**
 * The approved template list for the in-chat picker.
 *
 * Separate from getTemplates() in whatsapp.ts because that one calls
 * requireAdmin(), so a salesperson would silently get an empty list.
 */
export async function getInboxTemplates(): Promise<{
  templates: WhatsAppTemplate[]
  error?: string
}> {
  try {
    await requireInboxAccess()
  } catch {
    return { templates: [], error: 'Not authorized' }
  }

  const { templates, error } = await fetchTemplates()
  const approved = templates
    ?.filter((t) => t?.status?.toUpperCase() === 'APPROVED')
    ?.sort((a, b) => a.name.localeCompare(b.name))

  return { templates: approved ?? [], error }
}

/**
 * A template send from inside a chat — the only way to reach a customer once
 * the 24h window has closed.
 *
 * Also written to whatsapp_messages so the campaign log, the duplicate check
 * and the "failed before" flag all keep seeing every template that went out.
 * campaign_id stays null: this is a one-off reply, not part of a campaign.
 */
export async function sendChatTemplate(input: {
  conversationId: string
  templateName: string
  language: string
  variables?: TemplateVariables
}): Promise<SendChatResult> {
  let user
  try {
    user = await requireInboxAccess()
  } catch {
    return { error: 'Not authorized' }
  }

  if (!input?.conversationId) return { error: 'No conversation selected' }

  const supabase = createAdminClient()
  const { data: conversation } = await supabase
    .from('whatsapp_conversations')
    .select('id, phone, customer_id')
    .eq('id', input.conversationId)
    .maybeSingle()

  if (!conversation) return { error: 'Conversation not found' }

  const { templates, error: templatesError } = await fetchTemplates()
  if (templatesError && !templates?.length) return { error: templatesError }

  const template = templates?.find(
    (t) => t.name === input?.templateName && t.language === input?.language
  )
  if (!template) return { error: 'Template not found — refresh the template list' }

  const variables = input?.variables ?? EMPTY_VARIABLES
  const missing = missingVariables(template, variables)
  if (missing.length) return { error: `Fill in: ${missing.join(', ')}` }

  const headerMediaId = await resolveHeaderMediaId(template)
  const components = buildTemplateComponents(template, variables, headerMediaId)
  const bodyPreview = renderBodyPreview(template, variables)

  const result = await sendTemplate(
    conversation.phone,
    template.name,
    template.language,
    components
  )
  const sentAt = new Date().toISOString()
  const status = result?.ok ? 'sent' : 'failed'

  await supabase.from('whatsapp_messages').insert([
    {
      batch_id: randomUUID(),
      to_phone: conversation.phone,
      template_name: template.name,
      template_language: template.language,
      body_preview: bodyPreview || null,
      status,
      message_id: result?.messageId ?? null,
      error: result?.error ?? null,
      campaign_id: null,
      customer_id: conversation.customer_id ?? null,
      sent_by: user.id,
    },
  ])

  await recordMessages([
    {
      phone: conversation.phone,
      direction: 'outbound',
      origin: 'chat',
      messageId: result?.messageId ?? null,
      type: 'template',
      body: bodyPreview || null,
      status,
      error: result?.ok ? null : (result?.error ?? 'Send failed'),
      templateName: template.name,
      templateLanguage: template.language,
      sentBy: user.id,
      sentAt,
    },
  ])

  if (!result?.ok) return { error: result?.error ?? 'Send failed' }

  revalidatePath('/admin/whatsapp/inbox')
  revalidatePath('/admin/whatsapp')

  return {
    message: {
      id: result.messageId ?? sentAt,
      direction: 'outbound',
      origin: 'chat',
      messageId: result.messageId ?? null,
      type: 'template',
      body: bodyPreview || null,
      mediaFilename: null,
      status: 'sent',
      error: null,
      templateName: template.name,
      sentAt,
      sentByName: user.fullName,
    },
  }
}
