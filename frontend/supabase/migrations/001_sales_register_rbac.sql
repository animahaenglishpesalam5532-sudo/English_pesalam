-- =====================================================================
-- Sales Register + RBAC schema for English Pesalam
-- Run this in the Supabase SQL editor (once).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. PROFILES (role-based access control)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  role       text not null default 'staff' check (role in ('admin', 'staff')),
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Security-definer helpers (bypass RLS to avoid recursive policy checks)
create or replace function public.is_admin()
returns boolean
language sql security definer stable
set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active
  );
$$;

create or replace function public.is_active_member()
returns boolean
language sql security definer stable
set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_active
  );
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_active_member() to authenticated;

-- ---------------------------------------------------------------------
-- 2. CUSTOMERS (unique by phone number)
-- ---------------------------------------------------------------------
create table if not exists public.customers (
  id            uuid primary key default gen_random_uuid(),
  phone         text not null unique,
  name          text,
  is_auto_named boolean not null default false,
  created_by    uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Sequence powering "Customer-1", "Customer-2", ... auto names
create sequence if not exists public.customer_auto_seq;

-- ---------------------------------------------------------------------
-- 3. INTERACTIONS (each call / inquiry / purchase)
-- ---------------------------------------------------------------------
create table if not exists public.interactions (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  category    text not null check (category in ('general', 'book', 'pdf_ppt', 'video_course')),
  items       jsonb not null default '[]'::jsonb,   -- [{ type, id, title }]
  notes       text,
  call_type   text not null check (call_type in ('inquiry', 'purchase')),
  amount      numeric(12,2),
  call_at     timestamptz not null default now(),
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint purchase_needs_amount check (call_type <> 'purchase' or amount is not null)
);

create index if not exists interactions_customer_idx on public.interactions(customer_id);
create index if not exists interactions_call_at_idx   on public.interactions(call_at desc);
create index if not exists interactions_call_type_idx on public.interactions(call_type);
create index if not exists interactions_category_idx  on public.interactions(category);
create index if not exists interactions_created_by_idx on public.interactions(created_by);

-- ---------------------------------------------------------------------
-- 4. INTERACTION EDIT AUDIT LOG (admin-visible field history)
-- ---------------------------------------------------------------------
create table if not exists public.interaction_edits (
  id             uuid primary key default gen_random_uuid(),
  interaction_id uuid not null references public.interactions(id) on delete cascade,
  field          text not null,
  old_value      text,
  new_value      text,
  edited_by      uuid references public.profiles(id),
  edited_at      timestamptz not null default now()
);

create index if not exists interaction_edits_interaction_idx
  on public.interaction_edits(interaction_id);

-- ---------------------------------------------------------------------
-- 5. RPC: find-or-create customer + insert interaction (atomic)
--    Handles auto-naming for unknown callers.
-- ---------------------------------------------------------------------
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
  if not public.is_active_member() then
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
    -- We now know the real name for a previously-unknown caller
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

-- ---------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.customers         enable row level security;
alter table public.interactions      enable row level security;
alter table public.interaction_edits enable row level security;

-- profiles: read own or (admin reads all); only admin writes
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert with check (public.is_admin());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
  for delete using (public.is_admin());

-- customers: any active member reads/inserts/updates; admin deletes
drop policy if exists customers_select on public.customers;
create policy customers_select on public.customers
  for select using (public.is_active_member());

drop policy if exists customers_insert on public.customers;
create policy customers_insert on public.customers
  for insert with check (public.is_active_member());

drop policy if exists customers_update on public.customers;
create policy customers_update on public.customers
  for update using (public.is_active_member()) with check (public.is_active_member());

drop policy if exists customers_delete on public.customers;
create policy customers_delete on public.customers
  for delete using (public.is_admin());

-- interactions: any active member reads/inserts/updates; admin deletes
drop policy if exists interactions_select on public.interactions;
create policy interactions_select on public.interactions
  for select using (public.is_active_member());

drop policy if exists interactions_insert on public.interactions;
create policy interactions_insert on public.interactions
  for insert with check (public.is_active_member());

drop policy if exists interactions_update on public.interactions;
create policy interactions_update on public.interactions
  for update using (public.is_active_member()) with check (public.is_active_member());

drop policy if exists interactions_delete on public.interactions;
create policy interactions_delete on public.interactions
  for delete using (public.is_admin());

-- interaction_edits: any active member reads/inserts; nobody edits/deletes (except admin delete)
drop policy if exists interaction_edits_select on public.interaction_edits;
create policy interaction_edits_select on public.interaction_edits
  for select using (public.is_active_member());

drop policy if exists interaction_edits_insert on public.interaction_edits;
create policy interaction_edits_insert on public.interaction_edits
  for insert with check (public.is_active_member());

drop policy if exists interaction_edits_delete on public.interaction_edits;
create policy interaction_edits_delete on public.interaction_edits
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------
-- 7. SEED: promote your existing login to admin
--    >>> Replace the email below with YOUR admin email, then run. <<<
-- ---------------------------------------------------------------------
-- insert into public.profiles (id, email, full_name, role)
-- select id, email, 'Admin', 'admin' from auth.users
-- where email = 'YOUR_ADMIN_EMAIL@example.com'
-- on conflict (id) do update set role = 'admin', is_active = true;
