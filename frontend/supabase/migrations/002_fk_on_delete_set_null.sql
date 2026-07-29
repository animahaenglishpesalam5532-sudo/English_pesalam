-- =====================================================================
-- Allow deleting a staff member who has logged sales data.
--
-- Problem: customers.created_by, interactions.created_by and
-- interaction_edits.edited_by all reference public.profiles(id) with the
-- default NO ACTION rule. Deleting an auth user cascades to its profile
-- row, but if that staff member has created any customers/interactions,
-- the FK blocks the delete and Supabase returns "Database error deleting
-- user". Newly created staff (no data) delete fine.
--
-- Fix: rebuild those FKs with ON DELETE SET NULL. Deleting a staff member
-- keeps their sales history intact and just nulls out created_by/edited_by.
-- Run this once in the Supabase SQL editor.
-- =====================================================================

-- customers.created_by
alter table public.customers
  drop constraint if exists customers_created_by_fkey;
alter table public.customers
  add constraint customers_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;

-- interactions.created_by
alter table public.interactions
  drop constraint if exists interactions_created_by_fkey;
alter table public.interactions
  add constraint interactions_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;

-- interaction_edits.edited_by
alter table public.interaction_edits
  drop constraint if exists interaction_edits_edited_by_fkey;
alter table public.interaction_edits
  add constraint interaction_edits_edited_by_fkey
  foreign key (edited_by) references public.profiles(id) on delete set null;
