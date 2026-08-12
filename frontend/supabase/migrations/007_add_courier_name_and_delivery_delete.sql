-- =====================================================================
-- Add courier_name to book_tracking & allow delivery role to delete
-- Run this in the Supabase SQL editor (once).
-- =====================================================================

-- 1. Add courier_name column
alter table public.book_tracking
  add column if not exists courier_name text;

-- 2. Update delete policy to allow delivery role (is_delivery_member includes admin + delivery)
drop policy if exists book_tracking_delete on public.book_tracking;
create policy book_tracking_delete on public.book_tracking
  for delete using (public.is_delivery_member());
