## Goal

Give admins a single home at `/app/admin/campaigns` to:
1. **Send one-off campaigns** (broadcast emails) to filtered user segments.
2. **Configure automations** — rules that trigger emails on events (signup, abandoned checkout, low credits, plan downgrade, etc.) with delays.

All sending stays inside the existing **`send-email`** edge function pattern (Resend + branded VOVV.AI templates), so deliverability, branding, and unsubscribe behavior remain consistent.

---

## Part 1 — Campaigns (broadcast)

### Admin UI: `/app/admin/campaigns`
- **List view** — past + draft campaigns, status (draft / scheduled / sending / sent), recipient count, open/click stats.
- **Composer** (`/app/admin/campaigns/new`):
  - Subject line
  - Body editor — rich text + raw HTML toggle, branded VOVV.AI wrapper applied automatically (reuses `emailWrapper()` + `ctaButton()` from `send-email`)
  - Optional CTA button (label + URL)
  - **Audience targeting**:
    - All users / Free / Starter / Growth / Pro / Enterprise
    - Active in last N days (vs dormant)
    - Signed up between dates
    - Has used credits / never generated
    - Custom email list paste-in
  - **Test send** — to a single email before broadcast
  - **Schedule** — send now or pick datetime
- **Detail view** — per-recipient delivery status, opens, clicks, bounces.

### Database
New tables:
- `email_campaigns` — id, name, subject, html, cta_label, cta_url, audience_filter (jsonb), status, scheduled_at, sent_at, sent_count, created_by, created_at
- `email_campaign_recipients` — id, campaign_id, user_id, email, status (pending/sent/failed/bounced/opened/clicked), resend_message_id, sent_at
- RLS: admin-only read/write via `has_role(auth.uid(), 'admin')`

### Edge functions
- **`send-campaign`** — admin-invoked. Resolves audience filter → list of users → checks `suppressed_emails` → enqueues batched sends to Resend (rate-limited, ~10/sec) → writes per-recipient rows. Re-uses branded HTML wrapper.
- **`send-campaign-test`** — single test send.
- **`schedule-campaigns-tick`** — pg_cron every 5 min, picks `scheduled` campaigns whose time has come and invokes `send-campaign`.
- **`resend-webhook`** — receives Resend events (delivered/opened/clicked/bounced/complained), updates `email_campaign_recipients` and adds bounces to existing `suppressed_emails`.

### Compliance
- Every campaign automatically appends unsubscribe footer (uses existing `email_unsubscribe_tokens`).
- Suppression list checked before every send — bounces/unsubs never re-sent.
- Campaigns are flagged as **marketing** (separate from transactional) so users can unsub from marketing without losing transactional emails (welcome, low credits, generation done).

---

## Part 2 — Automations (event-triggered)

### Admin UI: `/app/admin/campaigns` → **Automations** tab
List of automation rules, each with: name, trigger, delay, template, audience filter, status (on/off), sent count last 30d.

**Composer** for each automation:
- **Trigger** (dropdown):
  - `user.signup` — new user created
  - `checkout.started` — Stripe checkout session created but not completed
  - `checkout.abandoned` — checkout started + N hours passed without `subscription_status = active`
  - `credits.low` — balance dropped below threshold (already partially exists)
  - `subscription.cancelled`
  - `subscription.renewed`
  - `inactive.user` — no generation in N days
- **Delay** — send immediately / after N minutes / N hours / N days
- **Template** — pick from existing branded templates OR write a custom one (subject + body, branded wrapper applied)
- **Audience filter** — same options as campaigns (e.g. only Free users)
- **Frequency cap** — max 1 send per user per rule (prevent re-sends)
- **Toggle on/off**

### Database
- `email_automations` — id, name, trigger_event, delay_minutes, template_html, subject, audience_filter (jsonb), is_active, frequency_cap, created_by
- `email_automation_log` — id, automation_id, user_id, triggered_at, sent_at, status, resend_message_id (used for frequency cap + audit)

### Triggering
- **`user.signup`** — `notify_new_user` trigger already calls `send-email`. We extend it to also enqueue any active `user.signup` automations into a new `email_automation_queue` table with `send_at = now() + delay`.
- **`checkout.started`** — `create-checkout` edge function inserts a row into `checkout_sessions` (new table: id, user_id, stripe_session_id, started_at, completed_at). On Stripe webhook completion, mark `completed_at`. Pg_cron job `process-automation-queue` runs every 5 min:
  - For `checkout.abandoned`, picks rows where `completed_at IS NULL AND started_at < now() - delay` → enqueues sends
  - For all queued automations with `send_at <= now()` → invokes `send-email` with the rendered template
- **`credits.low`** — already triggered in `deduct_credits`; extend to also fire automations.
- **`inactive.user`** — daily pg_cron job scans profiles for `last_generation_at < now() - N days`.

### Edge functions
- **`process-automation-queue`** — pg_cron every 5 min, drains `email_automation_queue`, respects frequency caps, sends via `send-email` pattern.
- Existing **`send-email`** gets a new generic type `custom_admin` that accepts subject + html so campaigns and automations can use it directly.

---

## Technical details

### Files to create
```
src/pages/admin/Campaigns.tsx              — list + automations tab
src/pages/admin/CampaignComposer.tsx       — new/edit campaign
src/pages/admin/CampaignDetail.tsx         — recipient + stats view
src/pages/admin/AutomationComposer.tsx     — automation editor
src/components/admin/campaigns/AudienceFilterBuilder.tsx
src/components/admin/campaigns/EmailEditor.tsx   — rich text + branded preview
src/hooks/useEmailCampaigns.ts
src/hooks/useEmailAutomations.ts

supabase/functions/send-campaign/index.ts
supabase/functions/send-campaign-test/index.ts
supabase/functions/process-automation-queue/index.ts
supabase/functions/schedule-campaigns-tick/index.ts
supabase/functions/resend-webhook/index.ts
```

### Files to modify
- `src/App.tsx` — add 3 admin routes (`/admin/campaigns`, `/admin/campaigns/new`, `/admin/campaigns/:id`)
- `src/components/app/AppSidebar.tsx` (or wherever admin nav lives) — add **Email Campaigns** link
- `supabase/functions/send-email/index.ts` — add `custom_admin` type with raw subject+html
- `supabase/functions/create-checkout/index.ts` — record `checkout_sessions` row
- `supabase/functions/check-subscription/index.ts` (or stripe webhook) — mark `completed_at` on success
- DB function `notify_new_user` — also enqueue signup automations
- DB function `deduct_credits` — also enqueue low-credit automations

### Migrations
1. Create tables: `email_campaigns`, `email_campaign_recipients`, `email_automations`, `email_automation_log`, `email_automation_queue`, `checkout_sessions`
2. RLS: admin-only on all (using existing `has_role` pattern)
3. Pg_cron: `schedule-campaigns-tick` (every 5 min), `process-automation-queue` (every 5 min), `scan-abandoned-checkouts` (every hour), `scan-inactive-users` (daily)

### Resend setup
- Use existing `RESEND_API_KEY`
- Add **`RESEND_WEBHOOK_SECRET`** secret (will request via add_secret tool when implementing) for verifying webhook signatures
- Configure webhook URL in Resend dashboard pointing at `resend-webhook` edge function (URL will be provided after deploy)

### Default automations seeded (off by default — admin enables)
1. **Welcome series** — `user.signup` + 0min delay (already exists, just migrated to automation system)
2. **Abandoned checkout** — `checkout.abandoned` + 1 hour delay → "Finish setting up your plan"
3. **Abandoned checkout reminder** — `checkout.abandoned` + 24 hour delay → "Still interested? Here's 10% off" (admin can edit)
4. **Inactive user** — `inactive.user` + 14 days → "We miss you"
5. **Low credits** — already exists, migrated

---

## Out of scope (can add later)
- A/B subject testing
- Drip sequences (multi-step automations) — v1 = single email per rule
- Resend Audiences API sync (we send via Resend's regular emails endpoint for full per-user template control)
- Visual drag-drop email builder (HTML editor + branded wrapper is enough for v1)

---

**Ready to build?** If you approve, I'll start with the migrations + admin Campaigns list/composer in the first pass, then automations + cron in the second.