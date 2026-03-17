

## Feature Highlights Nurture Email — Corrected Credit Tiers

### Credit reality
- **Minimum generation cost: 4 credits** (standard freestyle/workflow)
- 1-3 credits = can't do anything = same as 0
- So only two meaningful tiers exist

### Revised tiers

| Balance | Situation | Hero line | CTA |
|---------|-----------|-----------|-----|
| **0–3** | Can't generate | "You've seen what VOVV.AI can do — ready to create your first shoot?" | **"Get Credits →"** → `/pricing` |
| **4+** | Has usable credits | "Your free credits are waiting. Here's what you can create." | **"Open Your Studio →"** → `/app` |

**Skip condition:** Balance 0–3 AND zero generation jobs ever → skip entirely (never engaged, don't spam).

For the 0–3 tier, if the user *has* generated before (used up their credits), the tone shifts to appreciation: "You've already seen what VOVV.AI can do — upgrade to keep creating." If they haven't generated but have 1-3 leftover credits, they get: "Top up a few more credits to unlock your first AI photoshoot."

### Everything else stays the same
- 3 showcase images from landing-assets bucket
- Feature cards (Freestyle, Try-On, Workflows, Upscale)
- `feature_email_sent_at` column on profiles
- Hourly pg_cron job, batch of 50, respects `marketing_emails_opted_in`
- Dynamic `creditsBalance` passed from the cron function

### Changes
1. **`supabase/functions/send-email/index.ts`** — add `featuresHighlightEmail(data)` with two-tier conditional copy based on `creditsBalance >= 4` vs `< 4`
2. **SQL migration** — add column, create function (checks `credits_balance` and `generation_jobs` count), schedule cron

