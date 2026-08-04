-- =====================================================================
-- Book Delivery Tracking + "delivery" role
-- Run this in the Supabase SQL editor (once).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Allow a third role: 'delivery'
--    Existing 'staff' rows keep meaning "salesperson" — nothing to migrate.
-- ---------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'staff', 'delivery'));

-- Members allowed inside the sales area (salesperson + admin).
create or replace function public.is_sales_member()
returns boolean
language sql security definer stable
set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active and role in ('admin', 'staff')
  );
$$;

-- Members allowed inside the book tracking area (delivery person + admin).
create or replace function public.is_delivery_member()
returns boolean
language sql security definer stable
set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active and role in ('admin', 'delivery')
  );
$$;

grant execute on function public.is_sales_member() to authenticated;
grant execute on function public.is_delivery_member() to authenticated;

-- ---------------------------------------------------------------------
-- 2. BOOK TRACKING records
-- ---------------------------------------------------------------------
create sequence if not exists public.book_tracking_serial_seq;

create table if not exists public.book_tracking (
  id              uuid primary key default gen_random_uuid(),
  serial_no       bigint not null unique default nextval('public.book_tracking_serial_seq'),
  whatsapp_id     text not null,
  name            text not null,
  phone           text not null,
  tracking_number text not null,
  items           jsonb not null default '[]'::jsonb, -- [{ id, title, qty }]
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists book_tracking_created_at_idx on public.book_tracking(created_at desc);
create index if not exists book_tracking_whatsapp_idx   on public.book_tracking(whatsapp_id);
create index if not exists book_tracking_created_by_idx on public.book_tracking(created_by);

-- Next serial number, for the "Serial no." hint shown in the entry modal.
-- Reads the sequence without consuming a value, so the hint matches what the
-- next insert will actually receive.
create or replace function public.next_book_tracking_serial()
returns bigint
language sql security definer stable
set search_path = public as $$
  select case when is_called then last_value + 1 else last_value end
  from public.book_tracking_serial_seq;
$$;

grant execute on function public.next_book_tracking_serial() to authenticated;

alter table public.book_tracking enable row level security;

drop policy if exists book_tracking_select on public.book_tracking;
create policy book_tracking_select on public.book_tracking
  for select using (public.is_delivery_member());

drop policy if exists book_tracking_insert on public.book_tracking;
create policy book_tracking_insert on public.book_tracking
  for insert with check (public.is_delivery_member());

drop policy if exists book_tracking_update on public.book_tracking;
create policy book_tracking_update on public.book_tracking
  for update using (public.is_delivery_member()) with check (public.is_delivery_member());

drop policy if exists book_tracking_delete on public.book_tracking;
create policy book_tracking_delete on public.book_tracking
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------
-- 3. Keep delivery logins out of the sales data
--    (previously any active member could read customers + interactions)
-- ---------------------------------------------------------------------
drop policy if exists customers_select on public.customers;
create policy customers_select on public.customers
  for select using (public.is_sales_member());

drop policy if exists customers_insert on public.customers;
create policy customers_insert on public.customers
  for insert with check (public.is_sales_member());

drop policy if exists customers_update on public.customers;
create policy customers_update on public.customers
  for update using (public.is_sales_member()) with check (public.is_sales_member());

drop policy if exists interactions_select on public.interactions;
create policy interactions_select on public.interactions
  for select using (public.is_sales_member());

drop policy if exists interactions_insert on public.interactions;
create policy interactions_insert on public.interactions
  for insert with check (public.is_sales_member());

drop policy if exists interactions_update on public.interactions;
create policy interactions_update on public.interactions
  for update using (public.is_sales_member()) with check (public.is_sales_member());

drop policy if exists interaction_edits_select on public.interaction_edits;
create policy interaction_edits_select on public.interaction_edits
  for select using (public.is_sales_member());

drop policy if exists interaction_edits_insert on public.interaction_edits;
create policy interaction_edits_insert on public.interaction_edits
  for insert with check (public.is_sales_member());

-- The call-logging RPC must reject delivery logins too.
create or replace function public.log_interaction(
  p_phone     text,
  p_name      text,
  p_category  text,
  p_items     jsonb,
  p_notes     text,
  p_call_type text,
  p_amount    numeric,
  p_call_at   timestamptz
) returns public.interactions
language plpgsql security definer
set search_path = public as $$
declare
  v_customer    public.customers;
  v_interaction public.interactions;
  v_uid         uuid := auth.uid();
  v_name        text := nullif(trim(coalesce(p_name, '')), '');
begin
  if not public.is_sales_member() then
    raise exception 'Not authorized';
  end if;

  select * into v_customer from public.customers where phone = p_phone;

  if not found then
    if v_name is null then
      v_name := 'Customer-' || nextval('public.customer_auto_seq');
      insert into public.customers (phone, name, is_auto_named, created_by)
      values (p_phone, v_name, true, v_uid)
      returning * into v_customer;
    else
      insert into public.customers (phone, name, is_auto_named, created_by)
      values (p_phone, v_name, false, v_uid)
      returning * into v_customer;
    end if;
  elsif v_name is not null and v_customer.is_auto_named then
    update public.customers
    set name = v_name, is_auto_named = false, updated_at = now()
    where id = v_customer.id
    returning * into v_customer;
  end if;

  insert into public.interactions
    (customer_id, category, items, notes, call_type, amount, call_at, created_by)
  values
    (v_customer.id, p_category, coalesce(p_items, '[]'::jsonb), p_notes,
     p_call_type, p_amount, coalesce(p_call_at, now()), v_uid)
  returning * into v_interaction;

  return v_interaction;
end;
$$;

grant execute on function public.log_interaction(
  text, text, text, jsonb, text, text, numeric, timestamptz
) to authenticated;
