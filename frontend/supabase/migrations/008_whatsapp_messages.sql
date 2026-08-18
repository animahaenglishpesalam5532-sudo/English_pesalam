-- =====================================================================
-- WhatsApp template message log
-- Run this in the Supabase SQL editor (once).
-- =====================================================================

create table if not exists public.whatsapp_messages (
  id                uuid primary key default gen_random_uuid(),
  -- One send action (one template, many recipients) shares a batch id.
  batch_id          uuid not null,
  to_phone          text not null,
  template_name     text not null,
  template_language text not null,
  -- Body text with the {{n}} placeholders already filled in, so the log
  -- stays readable even if the template is later edited or deleted in Meta.
  body_preview      text,
  status            text not null check (status in ('sent', 'failed')),
  -- Meta's wamid, present when the send was accepted.
  message_id        text,
  error             text,
  sent_by           uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now()
);

create index if not exists whatsapp_messages_created_at_idx on public.whatsapp_messages(created_at desc);
create index if not exists whatsapp_messages_to_phone_idx   on public.whatsapp_messages(to_phone);
create index if not exists whatsapp_messages_batch_idx      on public.whatsapp_messages(batch_id);
create index if not exists whatsapp_messages_template_idx   on public.whatsapp_messages(template_name);

alter table public.whatsapp_messages enable row level security;

drop policy if exists whatsapp_messages_select on public.whatsapp_messages;
create policy whatsapp_messages_select on public.whatsapp_messages
  for select using (public.is_admin());

drop policy if exists whatsapp_messages_insert on public.whatsapp_messages;
create policy whatsapp_messages_insert on public.whatsapp_messages
  for insert with check (public.is_admin());

drop policy if exists whatsapp_messages_delete on public.whatsapp_messages;
create policy whatsapp_messages_delete on public.whatsapp_messages
  for delete using (public.is_admin());
