-- Exact storage figures for the sales tables.
-- Install once in the Supabase SQL editor, then `node scripts/db-size.mjs`
-- will report precise pg_total_relation_size numbers instead of an estimate.

create or replace function admin_table_sizes()
returns table (
  table_name   text,
  total_bytes  bigint,
  table_bytes  bigint,
  index_bytes  bigint,
  row_estimate bigint
)
language sql
security definer
set search_path = public
as $$
  select
    t.tbl                                   as table_name,
    pg_total_relation_size(t.reg)           as total_bytes,
    pg_table_size(t.reg)                    as table_bytes,
    pg_indexes_size(t.reg)                  as index_bytes,
    coalesce(c.reltuples::bigint, 0)        as row_estimate
  from (
    values
      ('interactions'),
      ('customers'),
      ('interaction_edits')
  ) as t(tbl)
  cross join lateral (select ('public.' || t.tbl)::regclass as reg) r
  join pg_class c on c.oid = r.reg;
$$;

-- Callable by the service role (and authenticated users) via PostgREST RPC.
grant execute on function admin_table_sizes() to service_role;
grant execute on function admin_table_sizes() to authenticated;
