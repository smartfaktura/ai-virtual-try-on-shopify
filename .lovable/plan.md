

## Pre-Launch Final Audit: Issues and Fixes

### What's Working Well
- Landing page hero, carousel, trust badges ("20 free credits") -- all correct
- Mobile responsiveness looks good on all landing sections
- Auth page design is polished with Google/Apple OAuth
- Onboarding flow is clean with 3-step wizard
- All app routes properly protected with ProtectedRoute
- RLS policies correctly scoped across all tables
- Storage buckets properly configured (public/private)
- Edge functions now have JWT validation
- No console errors detected

---

### Issue 1: Auth Page Says "5 free credits" (Text Bug - High)

**Problem:** The Auth page has TWO instances of "5 free credits" that were missed when the landing page was updated to "20 free credits":
- Line 75: "Start with 5 free credits -- no credit card required"
- Line 203: "5 free credits included with every new account"

This is the first thing new users see when signing up -- it's misleading and inconsistent with the landing page and the actual 20-credit allocation.

**Fix:** Update both strings in `src/pages/Auth.tsx` to say "20 free credits".

---

### Issue 2: FAQ Says "5 free visuals" (Text Bug - Medium)

**Problem:** The FAQ answer for "Is there a free trial?" says "Every new account gets 5 free visuals" -- should be 20 free credits.

**Fix:** Update the FAQ answer in `src/components/landing/LandingFAQ.tsx` line 39 to say "20 free credits" instead of "5 free visuals".

---

### Issue 3: Footer Social Links Are Dead (UX - Medium)

**Problem:** The footer has Twitter, LinkedIn, and Instagram links that all point to `#` (no real URLs). Clicking them does nothing, which looks unprofessional.

**Fix:** Either:
- Replace with real social media URLs if they exist
- Remove the social links section entirely until real URLs are available

Recommendation: Remove the social links for now to avoid a broken impression at launch.

---

### Issue 4: Enterprise "Contact Sales" Routes to Auth Page (UX - Low)

**Problem:** On the landing pricing section, the Enterprise "Contact Sales" button navigates to `/auth` (signup page) instead of `/contact`. Enterprise leads should be routed to the contact form.

**Fix:** Update the Enterprise CTA in `src/components/landing/LandingPricing.tsx` line 135 to navigate to `/contact` instead of `/auth`.

---

### Issue 5: Contact Form Doesn't Actually Send (Functional - Low)

**Problem:** The contact form at `/contact` shows a success toast but doesn't actually send the message anywhere (no backend integration). This is acceptable for MVP but should be noted.

**Fix:** No code change needed for launch -- just be aware that contact form submissions are not persisted or emailed. Can be connected to an email service post-launch.

---

### Summary of Code Changes Needed

| Priority | File | Change |
|----------|------|--------|
| High | `src/pages/Auth.tsx` | Change "5 free credits" to "20 free credits" (2 places) |
| Medium | `src/components/landing/LandingFAQ.tsx` | Change "5 free visuals" to "20 free credits" |
| Medium | `src/components/landing/LandingFooter.tsx` | Remove social links with `#` hrefs |
| Low | `src/components/landing/LandingPricing.tsx` | Enterprise CTA: navigate to `/contact` |

### No Issues Found In
- Database triggers and functions
- RLS policies (all properly scoped)
- Storage bucket visibility
- Edge function authentication
- Mobile responsiveness
- App shell navigation
- Product upload flow
- Onboarding wizard

