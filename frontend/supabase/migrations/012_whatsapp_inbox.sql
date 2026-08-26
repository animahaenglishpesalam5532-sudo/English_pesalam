-- =====================================================================
-- WhatsApp inbox — two-way conversations
--
-- Until now the webhook only console.logged inbound messages and dropped
-- them. These two tables store the actual conversation so the admin panel can
-- show a WhatsApp-style thread and reply inside Meta's 24h service window.
--
-- Run this by hand in the Supabase SQL editor — this project has no migration
-- runner. Written to be re-runnable.
-- =====================================================================

-- ---------------------------------------------------------------------
-- One row per phone number we have ever exchanged a message with.
--
-- A row is created on the first OUTBOUND message too (i.e. every broadcast
-- recipient gets one), so that when the customer eventually replies the
-- template that prompted the reply is already sitting in their thread.
-- `last_inbound_at is null` therefore means "never replied", and that is what
-- keeps silent broadcast recipients out of the inbox list.
-- ---------------------------------------------------------------------
create table if not exists public.whatsapp_conversations (
  id                  uuid primary key default gen_random_uuid(),
  -- E.164 digits without '+', the same shape Meta puts in the webhook `from`.
  phone               text not null unique,
  -- Resolved on first inbound only; customers.phone is stored as bare 10
  -- digits for India, so matching needs the digit variants (see migration 013).
  customer_id         uuid references public.customers(id) on delete set null,
  -- WhatsApp display name from the webhook's contacts[].profile.name.
  profile_name        text,
  last_message_at     timestamptz not null default now(),
  -- Drives the 24h customer service window. Null = this number has never
  -- messaged us, so only templates may be sent.
  last_inbound_at     timestamptz,
  -- Unread is derived, never stored as a counter: the webhook and the
  -- mark-as-read action write independently with no transaction between them,
  -- so a read-modify-write counter would silently lose increments.
  --   unread = last_inbound_at is not null
  --            and (last_read_at is null or last_inbound_at > last_read_at)
  last_read_at        timestamptz,
  -- Auto-reply cooldown. Lives here rather than in process memory because the
  -- in-memory Map in lib/whatsapp/autoReply.ts does not survive a cold start,
  -- which let the same customer get the marketing card repeatedly.
  last_auto_reply_at  timestamptz,
  last_message_preview text,
  last_direction      text,
  created_at          timestamptz not null default now()
);

-- The inbox list query: newest first, silent recipients excluded.
create index if not exists whatsapp_conversations_inbox_idx
  on public.whatsapp_conversations(last_message_at desc)
  where last_inbound_at is not null;

create index if not exists whatsapp_conversations_customer_idx
  on public.whatsapp_conversations(customer_id);

-- ---------------------------------------------------------------------
-- Every message in a thread, both directions.
--
-- Outbound broadcasts are written here AND to whatsapp_messages. The latter
-- stays the campaign log and is not touched by this migration, so every
-- existing report keeps working unchanged.
--
-- NOTE ON MEDIA: only the metadata is stored today, and the UI renders a
-- placeholder. Meta expires media IDs after 30 days, so any image or voice
-- note not downloaded within 30 days is permanently unrecoverable. That is a
-- deliberate, accepted trade-off to keep the first version small — the columns
-- exist so the download pipeline can be added without another migration.
-- ---------------------------------------------------------------------
create table if not exists public.whatsapp_conversation_messages (
  id                uuid primary key default gen_random_uuid(),
  conversation_id   uuid not null references public.whatsapp_conversations(id) on delete cascade,
  direction         text not null check (direction in ('inbound', 'outbound')),
  -- What produced this message, so the bubble can label it.
  origin            text not null check (origin in ('broadcast', 'chat', 'auto_reply', 'inbound')),
  -- Meta's wamid. Null for outbound sends Meta rejected outright.
  message_id        text,
  -- Deliberately NOT constrained: Meta keeps adding message types (reaction,
  -- order, system, unsupported...) and a CHECK here would drop them instead of
  -- storing them.
  type              text not null default 'text',
  -- Text body, media caption, or a rendered placeholder.
  body              text,
  media_id          text,
  media_mime        text,
  media_sha256      text,
  media_filename    text,
  -- Reserved for the future download pipeline; unused today.
  media_url         text,
  media_state       text,
  -- Outbound only; mirrors whatsapp_messages.status.
  status            text check (status is null or status in ('sent', 'delivered', 'read', 'failed')),
  error             text,
  template_name     text,
  template_language text,
  sent_by           uuid references public.profiles(id) on delete set null,
  -- Meta's clock, not ours. Webhooks arrive late and out of order, so using
  -- now() here would push the 24h window past its real expiry.
  sent_at           timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

-- The thread read: newest N for a conversation, then keyset-paginated older.
-- (sent_at, id) is a total order — an inbound message and the auto-reply it
-- triggers routinely share the same second.
create index if not exists whatsapp_conversation_messages_thread_idx
  on public.whatsapp_conversation_messages(conversation_id, sent_at desc, id desc);

-- Idempotency for redelivered webhooks, and the lookup key for status updates.
-- Partial because a rejected send has no wamid and several such rows are legitimate.
create unique index if not exists whatsapp_conversation_messages_wamid_key
  on public.whatsapp_conversation_messages(message_id)
  where message_id is not null;

-- Only server-side code (service role) touches these tables; no policies means
-- no direct access for logged-in users. This mirrors whatsapp_template_media
-- and is deliberate — unlike whatsapp_messages, which uses is_admin() policies.
alter table public.whatsapp_conversations enable row level security;
alter table public.whatsapp_conversation_messages enable row level security;

-- ---------------------------------------------------------------------
-- The single write path for both tables.
--
-- This is a function rather than PostgREST calls because:
--   * supabase.upsert() emits ON CONFLICT DO UPDATE SET <every column given>,
--     so it cannot express greatest(existing, excluded). Webhooks arrive out
--     of order, and a late one would drag last_inbound_at backwards and
--     re-open a window that has actually closed.
--   * ON CONFLICT DO UPDATE raises "cannot affect row a second time" when one
--     payload carries two messages from the same person — routine on a
--     webhook batch. Hence the group-by below.
--   * A 250-recipient broadcast becomes one round trip instead of ~750.
--
-- Returns the wamids that were genuinely inserted (i.e. not redeliveries),
-- which is the durable cross-instance signal used to decide whether an inbound
-- message still deserves an auto-reply.
-- ---------------------------------------------------------------------
create or replace function public.whatsapp_record_messages(p_rows jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted jsonb;
begin
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 then
    return '[]'::jsonb;
  end if;

  with incoming as (
    select
      r.*,
      coalesce(r.sent_at, now()) as at
    from jsonb_to_recordset(p_rows) as r(
      phone             text,
      direction         text,
      origin            text,
      message_id        text,
      type              text,
      body              text,
      media_id          text,
      media_mime        text,
      media_sha256      text,
      media_filename    text,
      status            text,
      error             text,
      template_name     text,
      template_language text,
      sent_by           uuid,
      sent_at           timestamptz,
      profile_name      text,
      customer_id       uuid,
      preview           text
    )
  ),
  -- One row per phone: ON CONFLICT DO UPDATE cannot touch the same row twice.
  per_phone as (
    select
      phone,
      max(at) as last_message_at,
      max(at) filter (where direction = 'inbound') as last_inbound_at,
      (array_agg(preview   order by at desc))[1] as last_message_preview,
      (array_agg(direction order by at desc))[1] as last_direction,
      (array_agg(profile_name) filter (where profile_name is not null))[1] as profile_name,
      (array_agg(customer_id) filter (where customer_id is not null))[1] as customer_id
    from incoming
    group by phone
  ),
  -- DO UPDATE (not DO NOTHING) so RETURNING yields a row for existing
  -- conversations too, which the message insert below needs to join against.
  conv as (
    insert into whatsapp_conversations as w (
      phone, last_message_at, last_inbound_at,
      last_message_preview, last_direction, profile_name, customer_id
    )
    select
      phone, last_message_at, last_inbound_at,
      last_message_preview, last_direction, profile_name, customer_id
    from per_phone
    on conflict (phone) do update set
      last_message_at = greatest(w.last_message_at, excluded.last_message_at),
      last_inbound_at = case
        when excluded.last_inbound_at is null then w.last_inbound_at
        when w.last_inbound_at is null then excluded.last_inbound_at
        else greatest(w.last_inbound_at, excluded.last_inbound_at)
      end,
      -- Only a genuinely newer message may rewrite the list preview.
      last_message_preview = case
        when excluded.last_message_at >= w.last_message_at
          then excluded.last_message_preview
        else w.last_message_preview
      end,
      last_direction = case
        when excluded.last_message_at >= w.last_message_at
          then excluded.last_direction
        else w.last_direction
      end,
      profile_name = coalesce(excluded.profile_name, w.profile_name),
      -- Never overwrite a link that has already been resolved.
      customer_id  = coalesce(w.customer_id, excluded.customer_id)
    returning w.id, w.phone
  ),
  saved as (
    insert into whatsapp_conversation_messages (
      conversation_id, direction, origin, message_id, type, body,
      media_id, media_mime, media_sha256, media_filename,
      status, error, template_name, template_language, sent_by, sent_at
    )
    select
      c.id, i.direction, i.origin, i.message_id, coalesce(i.type, 'text'), i.body,
      i.media_id, i.media_mime, i.media_sha256, i.media_filename,
      i.status, i.error, i.template_name, i.template_language, i.sent_by, i.at
    from incoming i
    join conv c on c.phone = i.phone
    -- DO NOTHING also collapses duplicates within this single statement,
    -- which DO UPDATE would reject.
    on conflict (message_id) where message_id is not null do nothing
    returning message_id
  )
  select coalesce(jsonb_agg(message_id) filter (where message_id is not null), '[]'::jsonb)
  into v_inserted
  from saved;

  return v_inserted;
end;
$$;

-- ---------------------------------------------------------------------
-- Atomic 24h claim for the auto-reply, replacing the per-instance Map.
--
-- The timestamp is set before the card is actually sent, so a failed send
-- costs that customer one auto-reply. That is the deliberate trade: sending
-- the marketing card twice is worse than not sending it once.
-- ---------------------------------------------------------------------
create or replace function public.whatsapp_claim_auto_reply(p_phone text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_claimed boolean;
begin
  update whatsapp_conversations
  set last_auto_reply_at = now()
  where phone = p_phone
    and (last_auto_reply_at is null or last_auto_reply_at < now() - interval '24 hours')
  returning true into v_claimed;

  return coalesce(v_claimed, false);
end;
$$;

-- Both functions are SECURITY DEFINER over RLS-less tables, so the default
-- "execute for PUBLIC" would let any logged-in user write messages.
revoke all on function public.whatsapp_record_messages(jsonb) from public, anon, authenticated;
revoke all on function public.whatsapp_claim_auto_reply(text)  from public, anon, authenticated;
grant execute on function public.whatsapp_record_messages(jsonb) to service_role;
grant execute on function public.whatsapp_claim_auto_reply(text)  to service_role;
