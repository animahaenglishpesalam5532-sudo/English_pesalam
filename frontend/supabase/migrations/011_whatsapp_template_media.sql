-- Cache of media IDs uploaded to Meta for template headers.
--
-- A media-header template needs a media parameter on every send. Passing the
-- template's own scontent.whatsapp.net handle as a `link` is unreliable — Meta
-- intermittently refuses to download from its own CDN and the send fails with
-- (#131053) Media upload error. Uploading the image to Meta once and sending the
-- resulting media ID avoids the download entirely.
--
-- Meta expires uploaded media after 30 days, so rows are refreshed on read.
--
-- Run this by hand in the Supabase SQL editor — this project has no migration runner.

create table if not exists public.whatsapp_template_media (
  template_name text primary key,
  media_id      text not null,
  -- The header_handle the upload came from; if Meta swaps the template's image
  -- this changes, and the cache is refreshed even when not yet expired.
  source_url    text,
  uploaded_at   timestamptz not null default now()
);

-- Only server-side code (service role) touches this; no policies means no
-- direct access for logged-in users, which is what we want.
alter table public.whatsapp_template_media enable row level security;
