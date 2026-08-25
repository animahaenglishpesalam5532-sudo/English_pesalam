# WhatsApp Cloud API Integration

How English Pesalam sends WhatsApp messages to customers, what is already built, and the
non-obvious constraints discovered while setting it up.

We use Meta's **WhatsApp Cloud API** directly (no BSP like Twilio/Gupshup).

---

## 1. Accounts and IDs

| Thing | Value |
| --- | --- |
| Meta Business ID | `836458386217637` |
| App ID | `2006294183580388` |
| WhatsApp Business Account (WABA) ID | `2114453192817782` |
| Phone Number ID | `1307134562476314` |
| Business (sending) number | +91 73058 17766 |
| Sales / orders number | +91 93456 39627 |
| System user for the permanent token | `whatsapp-api` |

The sales number is **not** the API number. Customers are handed off to the sales number
via a `wa.me` link; the API number only sends.

### Access token

A **System User** token is used, not a user token, because it never expires. It needs both
`whatsapp_business_messaging` and `whatsapp_business_management`, and the app + WABA must be
assigned to that system user with full control.

### Environment variables

Set in `frontend/.env.local` locally, and in Vercel for **Production _and_ Preview**:

```
WHATSAPP_APP_ID
WHATSAPP_APP_SECRET
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_WABA_ID
WHATSAPP_ACCESS_TOKEN
WHATSAPP_VERIFY_TOKEN
WHATSAPP_GRAPH_API_VERSION   # v21.0
```

Read via `src/lib/whatsapp/config.ts`. `.env.local` is gitignored.

---

## 2. Current status

- Number registered on Cloud API (`platform_type: CLOUD_API`), quality `GREEN`, `CONNECTED`
- Messaging limit: **TIER_250** — 250 unique business-initiated conversations per rolling 24h
- Business verification: **pending** (completing it raises the tier to 2,000/day)
- App is **published / Live** — required for production webhooks

---

## 3. What is built

### `/buy` redirect — `next.config.mjs`

Meta rejects `wa.me` links inside template **buttons**. The workaround: the button points at
`https://englishpesalam.com/buy`, and a Next redirect bounces the customer to
`https://wa.me/919345639627?text=...` with the enquiry text prefilled.

Two things worth remembering:

- The redirect lives in `next.config.mjs`, **not** an API route. Vercel serves it from the
  edge routing layer, so no serverless function is invoked or billed.
- Encode the prefilled text **exactly once** (`%20`). `next dev` decodes the destination one
  extra time, so a raw space shows up in the local `Location` header — that's expected and
  browsers re-encode it. Vercel does *not* decode, so `%2520` would reach the customer's chat
  box as literal `%20` characters.

`/online-class` works the same way, pointing at the enquiry number +91 63805 13228.

### Graph API client — `src/lib/whatsapp/client.ts`

Server-only wrapper over `POST /{PHONE_NUMBER_ID}/messages`:

- `sendText(to, body)` — free-form, only inside the 24h window
- `sendCtaUrl(to, message)` — interactive card with one URL button, only inside the 24h window
- `sendTemplate(to, name, language, components)` — the only way to reach a customer outside
  the window

### Auto-reply — `src/app/api/webhook/route.ts` + `src/lib/whatsapp/autoReply.ts`

Any inbound customer message gets an instant interactive card (book promo + "Buy Now" button
linking to the sales number with prefilled text). Sent with `after()` so the webhook still
returns 200 immediately.

Notes:

- `cta_url` interactive messages **do** allow `wa.me` links — the ban only applies to
  templates — so the auto-reply uses an interactive card rather than a template.
- Only inbound messages appear under `value.messages`, so our own sends can't cause a loop.
- Dedupe (`markMessageSeen`) and a 24h per-sender cooldown (`claimAutoReply`) are in-memory,
  so a cold start can occasionally allow a duplicate reply.
- POST bodies are verified against `X-Hub-Signature-256` (HMAC-SHA256 with the App Secret,
  compared with `timingSafeEqual`).

### Privacy policy — `src/app/privacy/page.tsx`

Meta requires a public privacy policy URL before an app can be published, and publishing is
what turns webhooks on in production. Includes a WhatsApp messaging section and STOP opt-out,
which also satisfies the data-deletion URL requirement.

### Admin broadcast panel — `/admin/whatsapp`

Admin-only page to send an approved template to many numbers at once:

- `src/app/actions/whatsapp.ts` — `getTemplates`, `sendTemplateMessages`,
  `getWhatsappMessagesPage`. Max 200 recipients per batch, 5 concurrent sends (Meta throttles
  bursts hard). Phone numbers are normalised and deduped server-side.
- `src/lib/whatsapp/templatesApi.ts` — lists templates from the WABA
- `src/lib/whatsapp/templates.ts` — `{{n}}` placeholder parsing, component building, preview
- `src/lib/whatsapp/phone.ts` — normalisation, defaults to country code 91
- `src/components/admin/whatsapp/*` — send form, template picker/preview, log table + filters
- `supabase/migrations/008_whatsapp_messages.sql` — the `whatsapp_messages` log table

The log stores a frozen `body_preview` so history stays readable after a template is edited.

> **Migrations are applied by hand.** This project has no migration runner — run
> `008_whatsapp_messages.sql` in the Supabase SQL editor.

---

## 4. Gotchas (each of these cost real debugging time)

**`hello_world` cannot be sent from a real number.** Meta reserves it for test numbers;
it fails with `(#131058)`. Use a real approved template, or free-form text inside the 24h
window.

**`wa.me` is banned in template buttons** ("Direct links to WhatsApp aren't allowed for
buttons") but is allowed in template **body text** and in interactive `cta_url` messages.

**`next dev` and Vercel decode redirect destinations differently.** Dev decodes the
destination once; Vercel passes it through verbatim. Encode for Vercel (single `%20`) — the
raw space you see locally with `curl -D -` is harmless. Getting this backwards puts literal
`%20` in the customer's chat box, which is only visible on a real phone, not in the headers.

**Webhooks need THREE things, and the dashboard only prompts for two:**

1. Callback URL + verify token saved under the **WhatsApp Business Account** product
   (not "User" — easy to pick the wrong one in the dropdown)
2. The app **published / Live** — unpublished apps get no production webhook traffic
3. `POST /{WABA_ID}/subscribed_apps` — **API-only, silently missing otherwise**

Symptom of (3): `GET /{WABA_ID}/subscribed_apps` returns `{"data":[]}` and nothing arrives,
even though `/{APP_ID}/subscriptions` shows `active: true`. This was the root cause of
messages being accepted by the API but never delivered.

**App icon uploads reject white backgrounds** — the icon must be RGBA with a transparent
background.

**Profile picture** is set with the 3-step resumable upload (`/uploads` → upload bytes →
`POST /{PHONE_NUMBER_ID}/whatsapp_business_profile` with the returned handle).

---

## 5. Outstanding

- `statuses` webhook callbacks aren't persisted, so the log shows API acceptance rather than
  real `delivered` / `read` / `failed`
- Business profile `about` and `email` fields are still empty
- Template `book_launch_buy_now` needs polish: button label "Visit website" → "Buy Now",
  body says "book" but header says "book 2", no footer
- Business verification pending → still capped at 250/day
