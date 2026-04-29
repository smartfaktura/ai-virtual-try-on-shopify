# Fix /app/admin/campaigns 404 + finish Phase 2

The Campaigns and CampaignComposer pages were created in Phase 1 but never registered in the router and not added to the admin sidebar — that's why `/app/admin/campaigns` 404s. Phase 2 (automation composer, cron, unsubscribe page) was also pending.

## What I'll do

### 1. Make the route work (fixes the 404)
- Register lazy imports + routes in `src/App.tsx`:
  - `/admin/campaigns` → `Campaigns`
  - `/admin/campaigns/new` → `CampaignComposer`
  - `/admin/campaigns/:id` → `CampaignComposer` (edit mode)
  - `/admin/campaigns/automations/new` → `AutomationComposer`
  - `/admin/campaigns/automations/:id` → `AutomationComposer`
- Add an "Email Campaigns" link to the admin section of the sidebar (`src/components/app/AppShell.tsx`).

### 2. Build AutomationComposer (`src/pages/admin/AutomationComposer.tsx`)
- Name, trigger event picker (`user.signup`, `checkout.abandoned`, `credits.low`, `inactive.user`), delay (minutes/hours), subject, body HTML, optional CTA.
- On/off toggle, frequency cap field, test send button.
- Inserts/updates `email_automations` row.

### 3. Public unsubscribe page (`src/pages/Unsubscribe.tsx`)
- Route `/unsubscribe?email=...&token=...` (public, no auth).
- Validates token via `email_unsubscribe_tokens`, inserts into `marketing_unsubscribes` + `suppressed_emails`, shows confirmation.
- Add route in `App.tsx` outside the authenticated shell.

### 4. Schedule cron jobs (migration)
- `pg_cron` job every 5 min → invokes `schedule-campaigns-tick` (handles scheduled campaigns + abandoned-checkout enqueueing).
- `pg_cron` job every 1 min → invokes `process-automation-queue`.
- Stores service role key in vault (idempotent, same pattern as email queue setup).

### 5. Small polish
- Campaigns list: show recipient stats inline + "Send test" + "Send now" buttons in composer (already in spec, verify wired).
- Suppressed-emails badge on recipient table.

## Technical notes
- All admin routes already gated by `useIsAdmin` in the page components themselves; no router-level guard change needed.
- Unsubscribe page must be public — placed outside the `<AppShell>` route tree.
- Cron migration uses `net.http_post` with the same vault-secret pattern as `notify_new_user`.

## Files touched
- edit: `src/App.tsx`, `src/components/app/AppShell.tsx`
- create: `src/pages/admin/AutomationComposer.tsx`, `src/pages/Unsubscribe.tsx`
- migration: pg_cron schedules

After approval I'll ship in one pass. The 404 itself is fixed by step 1 alone if you want me to do only that — say the word and I'll skip 2–4.
