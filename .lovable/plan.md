# Email Marketing Automations Playbook

Goal: produce a single super-detailed, step-by-step document covering every email marketing automation VOVV.AI should run in Resend, grounded in what's already wired (contact properties, event triggers, unsubscribe, suppression, branded shell). Save it to Lovable Cloud storage so you can open it from a link.

## What I'll include in the document

1. **System baseline** — short recap of what's already live so each automation references real fields:
   - Resend audience sync (`sync-resend-contact`) + registered properties: `plan`, `product_categories`, `signup_date`, `credits_balance`, `lifecycle_stage`, `subscription_status`, `subscription_renews_at`, `last_active_at`, `last_generated_at`, `total_generations`, `primary_category`, `referral_source`, `last_event`, `last_event_at`
   - Forwarded events from Lovable Cloud: signup, first generation, low credits, subscription changes, unsubscribe
   - Branded shell (`email-render.ts`), `RESEND_FROM`, marketing-unsubscribe flow, `suppressed_emails` enforcement

2. **Automation catalogue** — for each automation:
   - Purpose & success metric
   - Trigger (Resend property change or `last_event` value) with exact value to watch
   - Audience filter (plan, lifecycle_stage, suppressed, etc.)
   - Delay / send window
   - Subject line + preview text (3 variants)
   - Full body copy (VOVV.AI minimalist voice, no terminal periods in headers, Inter shell already handles styling)
   - CTA label + destination URL on vovv.ai
   - Exit / suppression rules
   - QA checklist before turning it on

3. **The automations themselves** (step-by-step build instructions inside Resend dashboard):
   - **Welcome series** (Day 0 / 1 / 3) — onboarding to first generation
   - **First-generation celebration** — fires on `last_event = first_generation`
   - **Activation nudge** — signup + no generation after 48h
   - **Category-tailored inspiration** — segmented by `primary_category` (apparel, eyewear, fragrance, shoes, etc.)
   - **Low-credits warning + top-up** — `last_event = low_credits`
   - **Credits depleted / use-it-or-lose-it reminder** — before monthly cycle reset
   - **Plan upgrade nudge** — Free → Starter, Starter → Pro based on usage thresholds
   - **Subscription renewal reminder** — uses `subscription_renews_at`
   - **Payment failed / dunning** — on `subscription_status = past_due`
   - **Win-back** — `last_active_at` > 30 days
   - **Churn / cancellation exit survey** — on `subscription_status = canceled`
   - **Feature announcements** (Visual Studio, Short Film, Creative Drops, Brand Models) — broadcast template per release
   - **Seasonal Creative Drops broadcasts** — tied to pg_cron drop schedule
   - **Referral / NPS** — after 5+ successful generations

4. **Segments to create in Resend** — exact filter definitions per segment used above.

5. **Governance** — suppression rules, marketing opt-in respect (`marketing_emails_opted_in`), unsubscribe link requirement, frequency caps, A/B test guidance, deliverability hygiene.

6. **Rollout checklist** — order to enable automations, what to register/extend in `register-resend-properties` if new fields are needed, monitoring via `resend_event_log` and admin Email Marketing page.

## Delivery

- Build the document as Markdown.
- Render to a styled PDF using the `docx`-style pipeline (pandoc → PDF) so it's readable outside the IDE.
- Create a public Supabase storage bucket `marketing-docs` (if missing) via migration with public SELECT policy.
- Upload both `email-automations-playbook.md` and `email-automations-playbook.pdf` to `marketing-docs/`.
- Return the two public URLs in chat so you can open them directly.

## Out of scope (this task)

- No Resend automations actually created — the doc is the spec you'll paste/configure in Resend.
- No new edge functions or property registrations unless the doc identifies a gap (in which case I'll list them as a follow-up, not build them now).
- No changes to existing email code.

Approve to generate and upload.