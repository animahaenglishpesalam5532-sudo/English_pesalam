# Prompt: make the WhatsApp inbox live (Supabase Realtime, no polling)

> Paste everything below the line into Claude Code when you're ready to build this.
> Written 2026-09-12, deferred for later. Verify the "current state" claims against
> the code before trusting them — they may have drifted.

---

## Task

Make `/admin/whatsapp/inbox` update live. New inbound WhatsApp messages, and delivery
status changes, should appear without the admin clicking Refresh — using **Supabase
Realtime**, not polling.

## Why not polling (do not propose it again)

Every poll tick is a Next.js server action = a Vercel function invocation, plus 2 real
Postgres queries. One tab polling every 10s for an 8-hour day is ~2,900 invocations and
~5,800 queries, almost all returning "nothing changed". Supabase is in the India region
while Vercel runs in `iad1`, so each query eats ~300ms round-trip. Realtime replaces all
of it with one idle WebSocket that costs nothing when nothing happens.

## Budget context (free plan, must stay inside it)

- Realtime: 200 concurrent connections (we use 1–2), **2,000,000 messages/month**.
- Expected real usage is under ~30,000/month — about 1.5% of quota.
- **The thing that would blow the quota:** subscribing to `whatsapp_conversation_messages`
  unfiltered. A 250-recipient broadcast writes 250 inserts + ~750 status updates = ~1,000
  events that the inbox does not care about. The subscription MUST be filtered so
  broadcast fan-out never reaches the socket.

## Current state (verify before relying on it)

- `src/components/admin/whatsapp/inbox/useInbox.ts` — all inbox client state.
  `refreshAll()` (~line 111) re-pulls the list and the open thread.
- `src/components/admin/whatsapp/inbox/InboxShell.tsx` (~line 80) — the Refresh button.
- `src/app/actions/whatsappInbox.ts` — server actions: `getConversations`,
  `getConversationThread`, `markConversationRead`, `sendChatText`, `getInboxTemplates`,
  `sendChatTemplate`. Types: `ConversationSummary`, `ThreadMessage`, `ConversationThread`.
- `src/app/api/webhook/route.ts` — Meta webhook. Writes via
  `src/lib/whatsapp/conversations.ts`, which calls the
  `whatsapp_record_messages(jsonb)` RPC (service role).
- `supabase/migrations/012_whatsapp_inbox.sql` — creates `whatsapp_conversations` and
  `whatsapp_conversation_messages`.
- `src/lib/supabase/client.ts` — `createBrowserClient` from `@supabase/ssr`, already exists.
- `public.is_admin()` — defined in `001_sales_register_rbac.sql`, granted to `authenticated`.
- Deps: `@supabase/ssr` ^0.10.2, `@supabase/supabase-js` ^2.103.0.
- Highest migration today is `014_whatsapp_auto_reply_setting.sql`, so **the new one is `015`**.

## THE BLOCKER — read this before writing any code

`012_whatsapp_inbox.sql` (~line 118) enables RLS on both inbox tables and creates
**zero policies**, deliberately: only the service role touches them. Realtime's
`postgres_changes` evaluates RLS as the *subscribing* user, so an admin browser session
today would subscribe successfully and receive **absolutely nothing, with no error**.
If you skip this, you will ship something that silently does nothing.

## Chosen approach: Option B — broadcast a signal, don't stream rows

Decided in discussion on 2026-09-12. Do this one:

1. A Postgres trigger on `whatsapp_conversation_messages` (and/or
   `whatsapp_conversations`) sends a Realtime **Broadcast** on a private channel.
2. The payload carries **no message content** — just enough to act on (e.g.
   `conversation_id`, `direction`, and the kind of change).
3. The client hears the signal and calls the **existing** server actions
   (`getConversations` / `getConversationThread`) to fetch the real data.

Cost: one Vercel invocation **per actual new message**, not one per 10 seconds. Still
~100x cheaper than polling, and the tables stay sealed — no browser read access.

**Rejected: Option A** (add `for select using (public.is_admin())` to both tables, add
them to the `supabase_realtime` publication, set `replica identity full`, stream rows
straight into the UI). Fewer moving parts and zero server calls, but it widens exactly
what migration 012 intentionally sealed. Only fall back to this if Option B turns out to
be unworkable — and say so before switching.

## Implementation

### 1. Migration `supabase/migrations/015_whatsapp_inbox_realtime.sql`

- Trigger function (SECURITY DEFINER, `set search_path = public`) that fires AFTER
  INSERT on `whatsapp_conversation_messages` and AFTER UPDATE of `status` on the same
  table, and emits a broadcast.
- **Emit selectively in SQL** — this is the quota control. Broadcasting only for
  `direction = 'inbound'` plus status changes is enough for the UI; broadcast fan-out
  must not produce ~1,000 events.
- Private channel + an RLS policy on `realtime.messages` restricting receipt to
  `public.is_admin()`.
- Must be **re-runnable** (`create or replace`, `drop trigger if exists`, `drop policy
  if exists`) — every migration in this repo is written that way.
- Header comment in the same style as 012: what it does, why, and "run by hand in the
  Supabase SQL editor".

**Verify the API surface before writing it.** Supabase's DB-side broadcast helpers
(`realtime.send(...)`, `realtime.broadcast_changes(...)`), the private-channel RLS model
on `realtime.messages`, and the required grants have changed across versions. Check the
current Supabase docs rather than trusting this prompt's memory of them.

### 2. Client subscription in `useInbox.ts`

- A `useEffect` that creates the channel on mount and calls
  `supabase.removeChannel(channel)` in cleanup. **Cleanup is mandatory** — without it,
  navigating between admin pages in the SPA stacks orphan channels and duplicate
  handlers fire.
- Private channels need the session token — call `supabase.realtime.setAuth()` (or
  confirm the `@supabase/ssr` browser client already does it) before subscribing.
- On a signal:
  - if it concerns the currently open conversation → re-fetch that thread and append,
    preserving scroll position (don't jump the user if they're reading history);
  - otherwise → refresh the conversation list so the row re-sorts and the unread dot
    appears.
- Debounce/coalesce bursts — several messages can land in the same second, and each
  one must not fire its own server action.
- Don't break the existing guards: the `requestRef` race guard for slow thread fetches,
  and the optimistic `unread: false` on select.

### 3. Keep the Refresh button

Sockets drop on laptop sleep, flaky wifi, and tab suspension. Keep the button as a
fallback, and also `refreshAll()` once on socket reconnect and on
`visibilitychange` → visible, so a tab that slept catches up.

## Non-negotiable repo constraints

- **This repo has no migration runner.** Do not try to apply `015` — print it and tell
  me to paste it into the Supabase SQL editor myself.
- **Never run `next build` while the dev server is running** — it clobbers the live
  `.next`. Verify with `npx tsc --noEmit` instead.
- **Ask before any commit, push, or PR.** Every time, even if approved before.
- Code style: split features into component folders + `lib` helpers; use optional
  chaining throughout.
- Don't restore the WhatsApp link in the admin sidebar — its removal is deliberate.

## Definition of done

1. `npx tsc --noEmit` clean.
2. Migration 015 printed for manual application, with a one-line note on what to watch
   for after running it.
3. With the inbox open and the migration applied: a **real inbound WhatsApp message to
   +91 73058 17766** appears in the thread and the list without clicking Refresh.
   (Realtime cannot be meaningfully tested without a real inbound message — say so
   rather than claiming it works.)
4. Sending a broadcast to many recipients does **not** flood the socket — confirm the
   filter holds.
5. Refresh button still works; closing the tab ends the connection.
