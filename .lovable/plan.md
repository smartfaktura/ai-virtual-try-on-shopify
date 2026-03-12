

## Audit: Email Subscriber System — What Exists, What's Missing

### What's Already Done
- **Auth flow** with email/password, Google, Apple, magic link signup
- **Profiles table** with `settings` JSONB column storing notification preferences
- **Settings page** with email notification toggles: generation complete, generation failed, low credits
- **Transactional emails** via Resend: Welcome, Generation Complete, Generation Failed, Low Credits
- **Custom auth emails** via `auth-email-hook` (notify.vovv.ai domain)
- **Onboarding flow** (3 steps: profile, referral source, product categories)

### What's Missing for Launch MVP

**1. Marketing email consent at signup**
- No checkbox on the signup form for "News & special offers" opt-in
- No `marketing_emails_opted_in` field on the `profiles` table
- Users who sign up via Google/Apple OAuth also need this captured (onboarding step)

**2. Resend audience sync**
- No mechanism to add/remove users from a Resend audience/contact list
- When a user signs up with consent checked, they should be added to a Resend audience
- When they toggle it off in Settings, they should be removed

**3. Marketing email preference in Settings**
- The Notifications section only has transactional email toggles
- Missing: "News, tips & special offers" toggle that syncs with Resend audience

**4. Newsletter subscribers table (for non-logged-in visitors)**
- No `newsletter_subscribers` table for popup/landing page email collection
- This is separate from logged-in user marketing consent

---

### Plan

**Database migration:**
- Add `marketing_emails_opted_in` boolean column to `profiles` (default `true` — checked by default at signup, GDPR-friendly with explicit checkbox)

**Auth.tsx (signup form):**
- Add a pre-checked checkbox below the confirm password field: "Send me news, tips & special offers via email"
- Store the value in component state
- After successful signup, update the profile's `marketing_emails_opted_in` via Supabase (the profile is auto-created by the `handle_new_user` trigger, so we update it after)

**Onboarding.tsx:**
- For OAuth users who skip the email signup form, add the same checkbox on Step 1 (profile step)
- Save it alongside other profile fields in the final `handleNext`

**Settings.tsx:**
- Add a "Marketing & Promotions" subsection under Email Notifications with a single toggle: "News, tips & special offers" bound to `marketing_emails_opted_in` on the profile (not in the `settings` JSONB — it's a top-level column for queryability)
- On toggle change, update the profile column directly

**Resend audience sync (Edge Function):**
- Create a `sync-resend-contact` edge function that accepts `{ email, firstName, opted_in }` and calls Resend's Contacts API to add/remove from an audience
- Called from: (a) after signup with consent, (b) when user toggles marketing preference in Settings
- Requires a `RESEND_AUDIENCE_ID` secret (you'd create the audience in Resend dashboard and store the ID)

**Newsletter subscribers table (for popups — separate concern):**
- Create `newsletter_subscribers` table for anonymous visitors collected via landing page popups
- This is a future addition and not blocking launch

---

### Priority for Launch MVP

| Item | Priority |
|------|----------|
| `marketing_emails_opted_in` column on profiles | Must have |
| Signup checkbox (email form) | Must have |
| Onboarding checkbox (OAuth users) | Must have |
| Settings toggle for marketing emails | Must have |
| Resend audience sync edge function | Nice to have (can batch-sync later) |
| Newsletter subscribers table + popup | Post-launch |

### Technical Details

- The `marketing_emails_opted_in` column is on `profiles` (not in `settings` JSONB) so it can be queried efficiently for bulk email sends
- The signup checkbox default is `true` (pre-checked) with clear label, matching industry standard opt-in patterns
- For sending campaigns pre-Resend-audience: query `SELECT email, display_name FROM profiles WHERE marketing_emails_opted_in = true` from an edge function

