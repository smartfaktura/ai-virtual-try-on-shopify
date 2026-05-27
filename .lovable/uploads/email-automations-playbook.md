# VOVV.AI — Email Marketing Automations Playbook

A step-by-step build guide for every lifecycle, transactional-marketing, and broadcast automation we should run in Resend, grounded in what is already wired in Lovable Cloud.

---

## 0. What is already live (do not rebuild)

You can rely on these in every automation:

**Contact sync** — `sync-resend-contact` edge function pushes every user to the Resend audience and updates registered properties whenever their data changes.

**Registered contact properties** (see `supabase/functions/register-resend-properties/index.ts`):

| Property | Type | Source | Used by |
|---|---|---|---|
| `plan` | string | profiles.plan | Segmenting Free vs paid |
| `product_categories` | string | comma-joined onboarding categories | Category broadcasts |
| `primary_category` | string | first / dominant category | Category-tailored series |
| `signup_date` | string (ISO) | profiles.created_at | Anniversaries, age-of-account |
| `credits_balance` | number | profiles.credits_balance | Low-credits, top-up |
| `lifecycle_stage` | string | derived (lead / active / paying / churned) | Master segmentation |
| `subscription_status` | string | Stripe sync | Dunning, renewal, churn |
| `subscription_renews_at` | string (ISO) | Stripe sync | Renewal reminders |
| `last_active_at` | string (ISO) | login / generation | Win-back |
| `last_generated_at` | string (ISO) | generation_jobs | Activation, win-back |
| `total_generations` | number | generation_jobs count | Power-user, referral |
| `referral_source` | string | utm / onboarding | Cohort reports |
| `last_event` | string | last fired event name | **Primary automation trigger** |
| `last_event_at` | string (ISO) | timestamp of last event | Recency filter |

**Event names already fired into Resend** (set `last_event` to one of these — automations key off equality on this property):

| Event | Fired from | Meaning |
|---|---|---|
| `user.signup` | `handle_new_user` trigger | Account created |
| `user.first_generation` | `enqueue_generation` RPC, first job only | Activation moment |
| `generation.milestone.first` | `fire_generation_milestone` | First completed job |
| `generation.milestone.10` | trigger | 10 completed |
| `generation.milestone.50` | trigger | 50 completed |
| `generation.milestone.100` | trigger | 100 completed (power user) |
| `credits.low` | `deduct_credits`, balance < 10, throttled 24h | Imminent run-out |
| `credits.purchased` | `add_purchased_credits` | Top-up succeeded |
| `user.unsubscribed` | `handle-marketing-unsubscribe` | Marketing opt-out |

Stripe-driven events (subscription created / updated / canceled / past_due) are forwarded by `sync-resend-contact` when called from the Stripe webhook with `event: "subscription.*"`. Use these as additional `last_event` triggers as we describe below.

**Branded shell** — `supabase/functions/_shared/email-render.ts` handles VOVV.AI wordmark, Inter typography, navy CTA pill, unsubscribe footer. When composing *inside Resend's dashboard*, replicate that shell visually: white background, single-column 560px, navy `#0f172a` text, `#1e293b` CTA button, 12px muted footer, Inter via Google Fonts.

**Sender** — `VOVV.AI <notifications@vovv.ai>` (constant `RESEND_FROM`).

**Suppression** — `suppressed_emails` and `marketing_unsubscribes` block all marketing. Every Resend automation **must** include an unsubscribe link to `https://vovv.ai/marketing-unsubscribe?email={{contact.email}}&token={{contact.unsubscribe_token}}` (Resend will append a one-click header automatically; this is the visible footer link).

**Admin dashboard** — `/admin/email-marketing` shows synced contacts, unsubscribes, and the last 50 events from `resend_event_log`. Use it as your QA surface after enabling each automation.

---

## 1. Segments to create first (in Resend → Audiences → Segments)

Build these once; every automation below references them by name.

| Segment name | Filter |
|---|---|
| **All — Marketable** | `unsubscribed = false` (Resend system field) |
| **Free users** | `plan = free` |
| **Starter** | `plan = starter` |
| **Growth** | `plan = growth` |
| **Pro+** | `plan in [pro, enterprise]` |
| **Any paid** | `plan in [starter, growth, pro, enterprise]` |
| **Activated** | `total_generations >= 1` |
| **Never generated** | `total_generations = 0` |
| **Power users** | `total_generations >= 50` |
| **Low credits** | `credits_balance < 10` AND `plan != free` |
| **Dormant 30d** | `last_active_at < now - 30 days` |
| **Dormant 60d** | `last_active_at < now - 60 days` |
| **At-risk subs** | `subscription_status = past_due` |
| **Renews in 7d** | `subscription_renews_at between now and now+7d` AND `plan != free` |
| **Category: Apparel** | `primary_category = apparel` (repeat for: eyewear, footwear, fragrance, jewelry, accessories, beauty, home, food, electronics) |

---

## 2. Lifecycle automations (build in this order)

For each automation: a) Resend → Automations → New, b) name it exactly as below, c) set trigger, d) set audience filter, e) build the email(s), f) enable.

### 2.1 Welcome series (3 emails)

**Goal:** get the user to their first generation within 72h.
**Trigger:** `last_event = user.signup`.
**Audience:** All — Marketable.
**Exit conditions:** `last_event = user.first_generation` exits the series immediately.

**Email 1 — sent immediately (0h)**
- Subject A: `Welcome to VOVV.AI`
- Subject B: `Your studio is ready`
- Subject C: `Start with one product photo`
- Preview text: `Turn a single product photo into a full visual library`
- Body (paste into Resend, keep navy Inter shell):
  ```
  Hey {{contact.first_name|there}},

  You're in. VOVV.AI turns one product photo into editorial scenes, on-model shots, lifestyle visuals and short films — without a studio booking.

  The fastest path: upload one product, pick a scene, and let the studio do the rest. You have 20 free credits ready to use.
  ```
- CTA: `Open Visual Studio` → `https://vovv.ai/app/workflows`
- QA: appears in `resend_event_log` with event `user.signup`, body renders Inter, unsubscribe link works.

**Email 2 — sent at +24h, only if `last_event != user.first_generation`**
- Subject A: `Three scenes worth trying first`
- Subject B: `Where most brands start`
- Body:
  ```
  If you're still deciding what to make first, these three scenes consistently produce the cleanest results on the first try:

  • White Studio — pure e-commerce hero on a clean white background
  • Editorial Lifestyle — your product in a curated environment with shallow depth of field
  • On-Model — a real-looking model wearing or holding your product

  Each one runs in under a minute on a single credit.
  ```
- CTA: `Browse scenes` → `https://vovv.ai/app/presets`

**Email 3 — sent at +72h, only if still `total_generations = 0`**
- Subject: `Want a 1:1 walkthrough`
- Body: short, human, offers founder reply.
  ```
  Most users get unstuck in five minutes once they see someone else upload a product. Reply to this email and I'll send you a 90-second screen recording for your category.
  ```
- No CTA button; reply-to behaviour relies on Resend's `reply_to` header → set it to a real inbox.

---

### 2.2 First-generation celebration (single email)

**Goal:** reinforce the aha-moment, push to second generation.
**Trigger:** `last_event = user.first_generation` OR `last_event = generation.milestone.first`.
**Audience:** All — Marketable.
**Delay:** send 10 minutes after the event (let them finish browsing the result).

- Subject A: `Your first shot is live`
- Subject B: `Nice — what's next`
- Body:
  ```
  You just made your first VOVV.AI image. The same product can now run through every other scene in the library — different backgrounds, different models, different camera angles — without re-uploading.

  Tip: open the Library and hit "Brand Ready" on the shots you'd actually publish. We use that signal to recommend better scenes next time.
  ```
- CTA: `Generate scene #2` → `https://vovv.ai/app/workflows`

---

### 2.3 Activation nudge (no first generation)

**Goal:** rescue signups who never generated.
**Trigger:** `last_event = user.signup` AND `total_generations = 0` AND `signup_date < now - 48h`. In Resend this is built as a scheduled segment send (daily 09:00 in user's timezone if you have it, otherwise 09:00 UTC) rather than an event trigger.
**Exit:** any generation. Send a maximum of 2 nudges per user, 5 days apart.

- Subject: `Stuck on uploading your first product`
- Body: 3 bullet troubleshooting + offer of a sample product to try with.
- CTA: `Try with a demo product` → `https://vovv.ai/app/workflows?demo=1`

---

### 2.4 Category-tailored inspiration

**Goal:** show users scenes proven to work for their category.
**Trigger:** scheduled weekly (Tuesday 10:00 user local / UTC fallback).
**Audience:** Activated AND `primary_category` is set. One automation per category — duplicate this for each.

Each category email surfaces 3 hero scenes from the Library deep-linked to `https://vovv.ai/app/presets?category={category}`. Image references come from `landing-assets` storage. Keep copy short — the images do the work.

- Subject template: `New {{category}} scenes worth trying`
- Body template: 3 image cards (200×250) with scene name and one-line description, each linking to the scene's deep link.
- Frequency cap: 1 per user per week across all category emails.

---

### 2.5 Low-credits warning

**Goal:** convert nearly-empty paid users to a top-up or upgrade.
**Trigger:** `last_event = credits.low`.
**Audience:** Any paid.
**Delay:** send immediately. Already throttled to once per 24h by `deduct_credits`.

- Subject A: `You have {{contact.credits_balance}} credits left`
- Subject B: `Running low — top up in one click`
- Body:
  ```
  You're down to {{contact.credits_balance}} credits on the {{contact.plan}} plan.

  Top-ups never expire. Upgrading to the next plan gives you more monthly credits at a lower per-image cost.
  ```
- Primary CTA: `Buy a top-up` → `https://vovv.ai/pricing#topups`
- Secondary CTA (text link): `See plans` → `https://vovv.ai/pricing`

Free users get a separate variant — see 2.7.

---

### 2.6 Renewal reminder (paid)

**Goal:** reduce involuntary churn; remind value before charge.
**Trigger:** segment "Renews in 7d", scheduled daily.
**Audience:** Renews in 7d.

- Subject: `Your VOVV.AI plan renews {{contact.subscription_renews_at|date}}`
- Body: 1-line confirmation, 3 stats from the last 30 days (total images, top scene, top product), CTA to manage billing.
- CTA: `Manage billing` → `https://vovv.ai/app/settings/billing`

The 30-day stats are not directly in contact properties — for v1, omit them and use a generic value reminder; for v2, add `last_30d_generations` to `register-resend-properties` (listed as a follow-up in §6).

---

### 2.7 Free → paid upgrade nudge

**Goal:** move engaged free users to Starter.
**Trigger:** scheduled, weekly Thursday 10:00.
**Audience:** Free users AND `total_generations >= 5` AND `last_active_at > now - 14d`.

- Subject A: `You're using VOVV.AI like a paid user`
- Subject B: `Unlock 2K downloads and short films`
- Body: 3 bullets that map directly to Starter benefits (more credits, 2K PNG always-on, Brand Profiles, video).
- CTA: `See Starter plan` → `https://vovv.ai/pricing`

---

### 2.8 Payment failed / dunning

**Goal:** recover failed renewals before Stripe cancels.
**Trigger:** `last_event = subscription.past_due` (fire this from the Stripe webhook via `sync-resend-contact`).
**Audience:** At-risk subs.

Sequence: T+0, T+2 days, T+5 days. Stop on `subscription_status = active`.

- T+0 Subject: `We couldn't charge your card`
- T+2 Subject: `Your VOVV.AI plan is at risk`
- T+5 Subject: `Last chance before downgrade`
- All CTAs: `Update payment method` → `https://vovv.ai/app/settings/billing`

Tone: factual, brief, no guilt. Always say what happens if they do nothing ("your plan downgrades to Free on …").

---

### 2.9 Win-back

**Goal:** re-engage users dormant 30+ days.
**Trigger:** scheduled daily; user enters segment **Dormant 30d** AND `total_generations >= 1`. Suppress if they have already received a win-back in the last 60 days.
**Audience:** Dormant 30d.

- Subject A: `Your studio is still here`
- Subject B: `What we shipped while you were away`
- Body: 3-card module of new features pulled from `/changelog` (manually updated when you launch new things — keep it timely).
- CTA: `Come back in` → `https://vovv.ai/app`

If still dormant after another 30 days (Dormant 60d), send a single "before we pause emails" message and then stop. Do **not** auto-unsubscribe — let the user click.

---

### 2.10 Cancellation exit survey

**Goal:** learn why people leave.
**Trigger:** `last_event = subscription.canceled`.
**Audience:** any (including just-canceled).
**Delay:** +1 hour.

- Subject: `One quick question`
- Body: 1 paragraph, then a 5-option list of clickable links (each link is `https://vovv.ai/feedback?reason=…`) so clicks are tracked in Resend without needing a form.
- No marketing CTA.

---

## 3. Engagement broadcasts (manual, not automations)

These are one-off broadcasts you compose in Resend → Broadcasts when something ships.

### 3.1 Feature announcements
- **Audience:** Activated users on All — Marketable.
- Template: one hero image (1200×600 from `landing-assets`), one-paragraph what-it-is, one-paragraph why-it-matters, one CTA, no PS.
- Brand voice: minimalist luxury restraint, no exclamation marks, no "🎉".

### 3.2 Creative Drops broadcasts
- Triggered manually each time a drop opens (the drop itself is created by pg_cron — see `creative_drops`).
- Audience: Activated, optionally filter by `primary_category` for category-themed drops.
- Body: 3 hero images from the drop, opens-in date, CTA `Enter the drop` → `https://vovv.ai/app/drops/{slug}`.

### 3.3 Monthly digest (optional, low-priority)
- 1st Tuesday of the month, 10:00 UTC.
- Audience: Activated.
- Content: most-used scene that month, one customer showcase, one tip. Skip if there's nothing genuinely new — silence beats filler.

---

## 4. Milestone congratulations

**Trigger:** `last_event in [generation.milestone.10, generation.milestone.50, generation.milestone.100]`.
**Audience:** All — Marketable.

One automation, three branches by event value. Copy:

- 10: `That's 10 shots in the books` — invite to share a Library link.
- 50: `50 shots — you're moving fast` — offer Brand Profile setup tip.
- 100: `100 shots — quietly impressive` — invite to apply for the case-study program.

No CTA pressure on any of these — they're relationship emails, not conversion emails.

---

## 5. Governance (apply to every automation)

- **Opt-in respect.** Resend's `unsubscribed` field is authoritative. We additionally suppress via `suppressed_emails` and `marketing_unsubscribes` on our side — Resend handles its side. Never re-subscribe a user automatically.
- **Marketing opt-in column.** `profiles.marketing_emails_opted_in` gates whether we sync a contact in the first place. If a user toggles it off in-app, `sync-resend-contact` will mark them unsubscribed in Resend.
- **Frequency caps.** No user should receive more than 3 marketing emails in any rolling 7-day window. Configure in Resend → Settings → Sending limits OR enforce per-segment with "received email X in last N days" filters.
- **Unsubscribe link.** Every email body must include the visible footer link in addition to Resend's one-click header.
- **A/B testing.** For lifecycle emails with subject variants (2.1, 2.2, 2.5, 2.7, 2.9), use Resend's built-in A/B on subject only — keep body identical for clean results. Run for 7 days minimum before picking a winner.
- **Deliverability hygiene.** Watch `marketing_unsubscribes` count weekly via `/admin/email-marketing`. If a single automation drives a spike, pause it.
- **No emojis in subjects, no terminal periods in headers** — house style.
- **Sender consistency.** All marketing from `notifications@vovv.ai`. Founder / human-reply emails (2.1 Email 3, 2.10) should set `reply_to` to a monitored inbox.

---

## 6. Rollout order (recommended)

1. Create all segments (§1). Block: nothing.
2. Welcome series (2.1) + First-gen celebration (2.2). Highest leverage.
3. Activation nudge (2.3).
4. Low credits (2.5) + Free → paid (2.7).
5. Dunning (2.8) + Renewal reminder (2.6).
6. Win-back (2.9) + Cancellation survey (2.10).
7. Category inspiration (2.4) once you have ≥500 contacts per category.
8. Milestones (§4).
9. Broadcasts (§3) — composed ad-hoc.

After each one, monitor `/admin/email-marketing` for 48h before enabling the next.

---

## 7. Gaps / engineering follow-ups (not built — flagging for next iteration)

These would unlock more precise automations but are out of scope for this document:

- **`last_30d_generations` property** — needed for renewal reminder stats (2.6).
- **`top_scene_30d` property** — would let category broadcasts (2.4) reference the user's actual top scene instead of a generic recommendation.
- **`subscription.past_due` event** — confirm Stripe webhook is forwarding this to `sync-resend-contact` with the right event name; if not, add it.
- **`subscription.canceled` event** — same as above.
- **Timezone field on profiles** — enables localized send times (currently we send in UTC).
- **In-app preferences page** — granular control beyond a single `marketing_emails_opted_in` toggle (e.g. "send me low-credits but not weekly inspiration"). Without this, unhappy users will hard-unsubscribe instead of dialing back.

Each of these can be added to `register-resend-properties/index.ts` and the relevant edge function in a follow-up.
