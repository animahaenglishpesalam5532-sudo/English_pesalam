-- =====================================================================
-- WhatsApp auto-reply message — editable from the admin panel
--
-- The text used to be a constant compiled into the serverless bundle, so
-- changing it needed a code edit and a redeploy. It now lives in `settings`
-- and the webhook reads it per send, which is what makes an admin edit take
-- effect immediately.
--
-- Run this by hand in the Supabase SQL editor — this project has no migration
-- runner. Written to be re-runnable.
-- =====================================================================

-- `do nothing` rather than `do update`: re-running this must never overwrite a
-- message the admin has since edited in the panel.
insert into public.settings (key, value, updated_at)
values (
  'whatsapp_auto_reply_message',
  $msg$📚 Spoken English Book வாங்க வேண்டுமா? 👉 9345639627
📄 PDF / Online Class வேண்டுமா? 👉 6380513228$msg$,
  now()
)
on conflict (key) do nothing;
