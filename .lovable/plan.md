## Plan: Move all marketing/automation to Resend, keep app lean

We delete our in-app campaign composer + automation builder, and instead push events + audience data to Resend so you manage everything (broadcasts, automations, segments) from the Resend dashboard.

---

### What gets removed (no longer needed)

**Pages**
- `src/pages/admin/Campaigns.tsx`
- `src/pages/admin/CampaignComposer.tsx`
- `src/pages/admin/AutomationComposer.tsx`
- Routes for `/app/admin/campaigns/*` and `/app/admin/automations/*` in `src/App.tsx`
- Sidebar entries in `src/components/app/AppShell.tsx`

**Edge functions**
- `send-campaign`
- `schedule-campaigns-tick`
- `process-automation-queue`

**Database (migration to drop)**
- Tables: `email_campaigns`, `email_campaign_recipients`, `email_automations`, `email_automation_queue`
- RPC: `resolve_email_audience` (replaced by Resend audience sync)
- Keep `marketing_unsubscribes` (still needed for compliance + sync to Resend)

---

### What stays / gets added

**1. Resend Audience sync (the contact list Resend uses for broadcasts + automations)**

New edge function: `sync-resend-contact`
- Called from `handle_new_user` trigger → adds new signup to Resend audience with metadata (plan, signup date, display_name, product_categories)
- Called from `check-subscription` when plan changes → updates contact metadata
- Called from `handle-marketing-unsubscribe` → marks contact as `unsubscribed: true` in Resend
- Uses `RESEND_AUDIENCE_ID` (already in your secrets ✓)

**2. Event forwarding (so Resend automations have triggers to fire on)**

New edge function: `track-resend-event`
Sends contact-level events Resend can use as automation triggers:
| Event sent to Resend | Fires from |
|---|---|
| `user.signup` | `handle_new_user` trigger |
| `user.first_generation` | `enqueue_generation` (when `is_first_generation = true`) |
| `credits.low` | `deduct_credits` (when balance < 10) |
| `subscription.started` | `check-subscription` (on first paid detection) |
| `subscription.canceled` | `check-subscription` (on downgrade to free) |
| `checkout.abandoned` | New `handle-checkout-abandoned` function called 1h after `create-checkout` if not fulfilled |

These events are sent as **contact attribute updates + tags** in Resend (e.g. tag `event:first_generation`, attribute `last_event_at`). Resend automations trigger off tag added or attribute changed.

**3. Keep one-click unsubscribe handling**
- `handle-marketing-unsubscribe` stays (List-Unsubscribe header compliance)
- Now also calls Resend API to mark contact unsubscribed there

**4. Admin UI — single thin page**

Replace Campaigns admin page with `src/pages/admin/EmailMarketing.tsx`:
- Big button "Open Resend Dashboard" → opens `https://resend.com/audiences/{RESEND_AUDIENCE_ID}` in new tab
- Stats card: total contacts synced, total unsubscribes, last sync status
- Manual "Resync all contacts" button (calls a `resync-resend-audience` function that batch-uploads all profiles)
- Recent events log (last 50 events sent to Resend)

**5. New tiny table: `resend_event_log`**
Stores what we sent to Resend, when, and the response — for debugging and the admin stats card.

---

### What you do in Resend (one-time, manual)

1. **Audience**: already exists (`RESEND_AUDIENCE_ID`)
2. **Broadcasts**: compose in Resend, send to audience or filtered segments
3. **Automations**: create once in Resend's automation builder using the tags/attributes we sync:
   - Trigger: tag `event:signup` added → Welcome email
   - Trigger: tag `event:first_generation` added → Congrats + tips
   - Trigger: tag `event:credits_low` added → Top-up nudge
   - Trigger: tag `event:checkout_abandoned` added → Recovery email
   - Trigger: tag `event:subscription_canceled` added → Win-back
4. **Segments**: filter by attributes we sync (`plan`, `signup_date`, `product_categories`) for targeted broadcasts

---

### Technical details

**Resend API calls used**
- `POST /audiences/{id}/contacts` — add contact
- `PATCH /audiences/{id}/contacts/{email}` — update attributes/unsubscribe
- `DELETE /audiences/{id}/contacts/{email}` — hard remove (not used; we soft-unsubscribe)
- Events sent as contact updates with `data: { tags: [...], attributes: {...} }`

**Auth**: All new functions use `RESEND_API_KEY` (already configured ✓)

**No cron jobs.** The only delayed event is `checkout.abandoned` — handled by enqueueing into existing `pgmq` queue with a 1h visibility timeout, processed by the already-running `process-email-queue` cron (no new cron added).

**Files to create**
- `supabase/functions/sync-resend-contact/index.ts`
- `supabase/functions/track-resend-event/index.ts`
- `supabase/functions/resync-resend-audience/index.ts`
- `supabase/functions/handle-checkout-abandoned/index.ts`
- `src/pages/admin/EmailMarketing.tsx`
- Migration: drop unused tables, add `resend_event_log`, update triggers

**Files to edit**
- `src/App.tsx` — swap routes
- `src/components/app/AppShell.tsx` — sidebar label "Email Marketing"
- `supabase/functions/check-subscription/index.ts` — fire subscription events
- `supabase/functions/create-checkout/index.ts` — schedule abandonment check
- `handle_new_user` trigger — call sync function
- `enqueue_generation` RPC — fire first_generation event
- `deduct_credits` RPC — fire credits_low event (already has email logic, just add Resend tag)

**Cost**: Resend free tier covers 3000 emails/month, 100/day. You only pay for emails actually sent. No infrastructure cost on our side beyond a few API calls per user event.

---

Reply "go" and I'll execute this cleanup + sync layer in one pass.