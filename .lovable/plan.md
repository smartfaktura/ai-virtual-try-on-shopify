

## Final Pre-Launch Audit: Issues Found

After a thorough review of every page, component, text string, route, and security configuration, here are the remaining issues:

---

### Issue 1: Onboarding Page Not Protected (Security/UX - High)

**Problem:** The `/onboarding` route is a public route -- anyone can access it without being logged in. The onboarding form renders fully, showing "Your profile" with name fields. While the final save will silently fail (no user object), this:
- Exposes internal UI to unauthenticated visitors
- Creates a confusing experience if someone stumbles onto it
- Could leak product category options and referral tracking questions

**Fix:** Wrap the `/onboarding` route with a simple auth check. If no user is logged in, redirect to `/auth`. This is different from `ProtectedRoute` (which also checks onboarding status), so a lightweight guard is needed.

**File:** `src/App.tsx` and/or `src/pages/Onboarding.tsx`

---

### Issue 2: CompetitorComparison Says "5 credits" (Text Bug - Medium)

**Problem:** The `CompetitorComparison.tsx` component (shown on the Generate page) says "Every account gets 5 credits to test the quality." This is the last remaining instance of the old "5 credits" text.

**Fix:** Change "5 credits" to "20 free credits" on line 44.

**File:** `src/components/app/CompetitorComparison.tsx`

---

### Issue 3: SocialProofBar Shows Placeholder Brand Logos (Design - Medium)

**Problem:** The `SocialProofBar.tsx` component displays "Brand A", "Brand B", "Brand C", "Brand D", "Brand E" as placeholder text in the "Trusted by" section. These are obviously fake and look unprofessional.

**Fix:** Remove the placeholder logo row entirely. Keep the metrics and testimonial sections, but drop the "Trusted by" + fake brand names until real brand logos are available.

**File:** `src/components/landing/SocialProofBar.tsx`

---

### Issue 4: CompetitorComparison Uses Generic Names (Design - Low)

**Problem:** The same `CompetitorComparison.tsx` component uses "Competitor A" and "Competitor B" as comparison names. This looks placeholder-ish. While it might be intentional (to avoid naming competitors), it reduces credibility.

**Fix:** Replace with more descriptive labels like "Traditional AI Tools" and "Photo Studios" to make the comparison feel real without naming specific competitors.

**File:** `src/components/app/CompetitorComparison.tsx`

---

### Summary of Changes

| Priority | File | Change |
|----------|------|--------|
| High | `src/pages/Onboarding.tsx` | Add auth guard -- redirect unauthenticated users to `/auth` |
| Medium | `src/components/app/CompetitorComparison.tsx` | Change "5 credits" to "20 free credits" |
| Medium | `src/components/landing/SocialProofBar.tsx` | Remove fake "Brand A-E" placeholder logos |
| Low | `src/components/app/CompetitorComparison.tsx` | Replace "Competitor A/B" with descriptive labels |

### What's Verified and Working

- Landing page hero, trust badges, and FAQ all say "20 free credits"
- Auth page says "20 free credits" in both places
- Footer has no dead social links
- Enterprise CTA routes to `/contact`
- Mobile layout looks correct across landing and auth pages
- RLS policies are properly scoped on all tables
- Storage buckets configured correctly (public/private)
- Edge functions have JWT validation
- Signed URL logic only signs private buckets
- Onboarding saves to correct profile fields
- Dashboard shows 20 credits for new users
- 404 page is functional

