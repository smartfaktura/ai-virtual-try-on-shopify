

## Replace cron nurture email with Resend contact tagging

Instead of sending the 24h feature highlight email ourselves, we'll tag contacts in Resend with useful properties so you can build automations directly in Resend's Broadcast/Automation UI.

### What gets removed

1. **pg_cron job** `send-feature-highlight-emails` — unschedule it
2. **PL/pgSQL function** `send_feature_highlight_emails()` — drop it
3. **`features_highlight` template** in `send-email/index.ts` — remove the case and the `featuresHighlightEmail()` function (~100 lines)
4. The `feature_email_sent_at` column can stay (harmless, avoids another migration for cleanup)

### What gets added

**Resend contact properties** — when syncing a contact via `sync-resend-contact`, we'll pass custom properties that Resend stores on the contact:

| Property | Value | Use in Resend |
|----------|-------|---------------|
| `plan` | `free`, `starter`, `growth`, `pro` | Segment by plan |
| `credits_balance` | number | Trigger automation when low |
| `has_generated` | `true`/`false` | Distinguish engaged vs passive |
| `signup_date` | ISO date string | Time-based automations (e.g. "24h after signup") |

**`sync-resend-contact/index.ts`** — updated to accept and forward a `properties` object to the Resend create/update contact API:
```
body: JSON.stringify({
  email,
  first_name,
  unsubscribed: false,
  properties: { plan, credits_balance, has_generated, signup_date }
})
```

**Callers updated** (Auth.tsx, Onboarding.tsx, Settings.tsx) — pass additional data when invoking `sync-resend-contact`. Each caller will include the properties it has access to (plan defaults to `free` at signup, credits default to `20`).

**New: profile-change sync** — add a lightweight call in `sync-resend-contact` that also fires when credits change or plan changes. For the initial version, we tag at signup/onboarding time. You can later add a database trigger or periodic backfill to keep tags fresh.

### What you can do in Resend after this

- Create a segment: `plan = free AND signup_date < 24h ago`
- Build an automation: "When contact enters segment → wait 24h → send feature highlight email"
- Use `credits_balance` and `has_generated` to branch the automation (engaged vs passive users)
- Full control over timing, A/B testing, and sequences without code changes

### Files changed
- `supabase/functions/sync-resend-contact/index.ts` — accept & forward `properties`
- `supabase/functions/send-email/index.ts` — remove `features_highlight` case + template
- `src/pages/Auth.tsx` — pass properties to sync call
- `src/pages/Onboarding.tsx` — pass properties to sync call
- `src/pages/Settings.tsx` — pass properties to sync call
- SQL: unschedule cron job + drop function

