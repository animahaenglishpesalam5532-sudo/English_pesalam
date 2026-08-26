-- =====================================================================
-- Backfill the inbox from the existing broadcast log.
--
-- Kept separate from 012 so that migration stays purely structural and
-- re-runnable. This one moves data.
--
-- Every backfilled conversation gets last_inbound_at = NULL, so the inbox list
-- (which filters on `last_inbound_at is not null`) stays EMPTY after this runs.
-- That is correct: no inbound message has ever been stored, because until now
-- the webhook only console.logged replies. The point of the backfill is that
-- when a customer does eventually reply, the template that prompted them is
-- already sitting in their thread instead of the thread starting mid-sentence.
--
-- Run by hand in the Supabase SQL editor, AFTER 012.
-- =====================================================================

-- ---------------------------------------------------------------------
-- STEP 0 — run this on its own first. It must return zero rows.
--
-- 012 puts a unique index on message_id. If Meta ever handed back the same
-- wamid twice (or a send was logged twice), the insert below aborts and you
-- will need to decide which row to keep.
-- ---------------------------------------------------------------------
-- select message_id, count(*)
-- from public.whatsapp_messages
-- where message_id is not null
-- group by 1
-- having count(*) > 1;

-- ---------------------------------------------------------------------
-- STEP 1 — one conversation per number we have ever broadcast to.
--
-- customers.phone is stored as bare 10 digits for Indian numbers and as
-- +E.164 for everything else (see InteractionModal), whereas whatsapp_messages
-- stores full digits with no '+'. All three shapes have to be tried.
--
-- `do nothing` rather than `do update`: if this is re-run after the webhook has
-- started writing, a live conversation must not be reset to outbound-only.
-- ---------------------------------------------------------------------
with per_phone as (
  select
    w.to_phone as phone,
    max(w.created_at) as last_message_at,
    (array_agg(w.body_preview order by w.created_at desc, w.id desc))[1] as last_message_preview
  from public.whatsapp_messages w
  where w.to_phone is not null and w.to_phone <> ''
  group by w.to_phone
),
linked as (
  select
    p.*,
    (
      select c.id
      from public.customers c
      where c.phone = p.phone
         or c.phone = '+' || p.phone
         or (length(p.phone) >= 10 and c.phone = right(p.phone, 10))
      order by c.created_at asc
      limit 1
    ) as customer_id
  from per_phone p
)
insert into public.whatsapp_conversations (
  phone, customer_id, last_message_at, last_inbound_at,
  last_message_preview, last_direction
)
select
  phone,
  customer_id,
  last_message_at,
  null,                        -- never replied; keeps them out of the inbox
  left(last_message_preview, 140),
  'outbound'
from linked
on conflict (phone) do nothing;

-- ---------------------------------------------------------------------
-- STEP 2 — copy each logged broadcast into the thread.
--
-- Accepted sends carry a wamid and are protected by the partial unique index.
-- Rejected sends have message_id = null and no natural key at all, so they are
-- guarded by the `not exists` below — without it a second run would duplicate
-- exactly the failures.
-- ---------------------------------------------------------------------
insert into public.whatsapp_conversation_messages (
  conversation_id, direction, origin, message_id, type, body,
  status, error, template_name, template_language, sent_by, sent_at
)
select
  c.id,
  'outbound',
  'broadcast',
  w.message_id,
  'template',
  w.body_preview,
  w.status,
  w.error,
  w.template_name,
  w.template_language,
  w.sent_by,
  w.created_at
from public.whatsapp_messages w
join public.whatsapp_conversations c on c.phone = w.to_phone
where w.message_id is not null
   or not exists (
     select 1
     from public.whatsapp_conversation_messages m
     where m.conversation_id = c.id
       and m.origin = 'broadcast'
       and m.message_id is null
       and m.sent_at = w.created_at
   )
on conflict (message_id) where message_id is not null do nothing;

-- ---------------------------------------------------------------------
-- STEP 3 — verify. Run these afterwards; all three should hold.
-- ---------------------------------------------------------------------
-- -- conversations created == distinct broadcast recipients
-- select
--   (select count(distinct to_phone) from public.whatsapp_messages) as recipients,
--   (select count(*) from public.whatsapp_conversations)            as conversations;
--
-- -- the inbox list is empty, because nobody has replied yet
-- select count(*) from public.whatsapp_conversations where last_inbound_at is not null;
--
-- -- every logged message landed in a thread
-- select
--   (select count(*) from public.whatsapp_messages)              as logged,
--   (select count(*) from public.whatsapp_conversation_messages) as threaded;
