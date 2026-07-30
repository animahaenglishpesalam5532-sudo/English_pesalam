-- ---------------------------------------------------------------------
-- YouTube Revenue: admin-entered daily revenue figures for reporting.
-- ---------------------------------------------------------------------
create table if not exists public.youtube_revenue (
  id         uuid primary key default gen_random_uuid(),
  earned_on  date not null,
  revenue    numeric(12,2) not null check (revenue >= 0),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists youtube_revenue_earned_on_idx on public.youtube_revenue(earned_on desc);

alter table public.youtube_revenue enable row level security;

-- Any active member may read; only admins may write.
drop policy if exists youtube_revenue_select on public.youtube_revenue;
create policy youtube_revenue_select on public.youtube_revenue
  for select using (public.is_active_member());

drop policy if exists youtube_revenue_insert on public.youtube_revenue;
create policy youtube_revenue_insert on public.youtube_revenue
  for insert with check (public.is_admin());

drop policy if exists youtube_revenue_update on public.youtube_revenue;
create policy youtube_revenue_update on public.youtube_revenue
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists youtube_revenue_delete on public.youtube_revenue;
create policy youtube_revenue_delete on public.youtube_revenue
  for delete using (public.is_admin());
