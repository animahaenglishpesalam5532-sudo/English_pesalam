-- ---------------------------------------------------------------------
-- PDFs: add an explicit sort_order so admins can drag-and-drop the display
-- order shown on the public PDF guides page.
-- ---------------------------------------------------------------------
alter table public.pdfs add column if not exists sort_order integer not null default 0;

-- Backfill: preserve the current display order (featured first, then newest)
-- by assigning ascending sort_order values.
with ordered as (
  select id, (row_number() over (order by is_featured desc, created_at desc) - 1) as rn
  from public.pdfs
)
update public.pdfs p set sort_order = o.rn from ordered o where p.id = o.id;

create index if not exists pdfs_sort_order_idx on public.pdfs(sort_order asc);
