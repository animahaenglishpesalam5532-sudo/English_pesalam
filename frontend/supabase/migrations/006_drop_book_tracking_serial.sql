-- =====================================================================
-- Drop S.No (serial_no) sequence and column from book_tracking
-- Run this in the Supabase SQL editor (once).
-- =====================================================================

-- 1. Drop the helper function
drop function if exists public.next_book_tracking_serial();

-- 2. Drop the column from the table
alter table public.book_tracking drop column if exists serial_no;

-- 3. Drop the sequence
drop sequence if exists public.book_tracking_serial_seq;
