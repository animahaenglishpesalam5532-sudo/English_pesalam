-- =====================================================================
-- WhatsApp campaigns + link every sent message to a campaign / customer
-- Run this in the Supabase SQL editor (once).
-- =====================================================================

create table if not exists public.whatsapp_campaigns (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  starts_on   date,
  ends_on     date,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists whatsapp_campaigns_created_at_idx
  on public.whatsapp_campaigns(created_at desc);

alter table public.whatsapp_campaigns enable row level security;

drop policy if exists whatsapp_campaigns_select on public.whatsapp_campaigns;
create policy whatsapp_campaigns_select on public.whatsapp_campaigns
  for select using (public.is_admin());

drop policy if exists whatsapp_campaigns_insert on public.whatsapp_campaigns;
create policy whatsapp_campaigns_insert on public.whatsapp_campaigns
  for insert with check (public.is_admin());

drop policy if exists whatsapp_campaigns_update on public.whatsapp_campaigns;
create policy whatsapp_campaigns_update on public.whatsapp_campaigns
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists whatsapp_campaigns_delete on public.whatsapp_campaigns;
create policy whatsapp_campaigns_delete on public.whatsapp_campaigns
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------
-- Every send now belongs to a campaign. `customer_id` is filled when the
-- recipient was picked from the records, so the customer drilldown can
-- show which templates that customer has received.
-- ---------------------------------------------------------------------
alter table public.whatsapp_messages
  add column if not exists campaign_id uuid references public.whatsapp_campaigns(id) on delete set null,
  add column if not exists customer_id uuid references public.customers(id) on delete set null;

create index if not exists whatsapp_messages_campaign_idx on public.whatsapp_messages(campaign_id);
create index if not exists whatsapp_messages_customer_idx on public.whatsapp_messages(customer_id);

-- Answers "has this number already received this template?" in one index hit.
create index if not exists whatsapp_messages_template_phone_idx
  on public.whatsapp_messages(template_name, to_phone) where status = 'sent';
