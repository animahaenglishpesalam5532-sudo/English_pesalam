-- Delivery status from Meta's status webhook.
--
-- Until now `status` only recorded whether Meta ACCEPTED the send ('sent') or
-- rejected it outright ('failed'). Acceptance is not delivery: Meta can accept a
-- marketing template and then silently drop it (e.g. per-user marketing
-- frequency capping, error 131049). The webhook reports the real outcome, so we
-- widen the column to hold it.
--
-- Run this by hand in the Supabase SQL editor — this project has no migration runner.

alter table public.whatsapp_messages
  drop constraint if exists whatsapp_messages_status_check;

alter table public.whatsapp_messages
  add constraint whatsapp_messages_status_check
  check (status in ('sent', 'delivered', 'read', 'failed'));

-- The webhook looks each message up by Meta's wamid.
create index if not exists whatsapp_messages_message_id_idx
  on public.whatsapp_messages(message_id);

-- The duplicate-recipient check treats anything that reached Meta as "sent",
-- so the partial index has to cover the new statuses too.
drop index if exists public.whatsapp_messages_template_phone_idx;
create index if not exists whatsapp_messages_template_phone_idx
  on public.whatsapp_messages(template_name, to_phone)
  where status in ('sent', 'delivered', 'read');
