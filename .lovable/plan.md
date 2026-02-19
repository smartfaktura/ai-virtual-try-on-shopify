

## Full Platform Audit: Issues Found Before Launch

After reviewing every page, component, route, auth flow, and edge case, here are the remaining issues organized by priority.

---

### ISSUE 1: No "Forgot Password" Flow (Security/UX - HIGH)

**Problem:** There is no password reset functionality anywhere in the app. The Auth page has email/password login but no "Forgot password?" link. Users who sign up with email and forget their password have no way to recover their account.

**Impact:** Users are permanently locked out if they forget their password. This is a basic authentication requirement.

**Fix:**
- Add a "Forgot password?" link on the Auth page login form
- Create a `/reset-password` page that handles the recovery token
- Wire up `supabase.auth.resetPasswordForEmail()` and `supabase.auth.updateUser({ password })`
- Add the `/reset-password` route in App.tsx as a public route

**Files:** `src/pages/Auth.tsx`, new `src/pages/ResetPassword.tsx`, `src/App.tsx`

---

### ISSUE 2: Email Signup Redirects to Root Instead of `/app` (UX - HIGH)

**Problem:** In `AuthContext.tsx`, the `emailRedirectTo` for email signups is set to `window.location.origin` (the root `/`). When a user clicks the confirmation email link, they land on the Landing page instead of being redirected into the app. The OAuth redirect was already fixed to `/app`, but email signup was missed.

**Fix:** Change `emailRedirectTo: window.location.origin` to `emailRedirectTo: window.location.origin + '/app'` in `AuthContext.tsx` line 44.

**File:** `src/contexts/AuthContext.tsx`

---

### ISSUE 3: Contact Form Doesn't Save Data (Functional - HIGH)

**Problem:** The Contact page (`src/pages/Contact.tsx`) shows a toast "Message sent!" but does absolutely nothing with the data -- it just clears the form. Enterprise leads, support requests, and partnership inquiries are silently lost.

**Fix:** Create a `contact_submissions` database table and save the form data. Add RLS policies so submissions are insert-only for anyone and readable only by admins.

**Files:** `src/pages/Contact.tsx`, database migration

---

### ISSUE 4: SocialProofBar Still Has Unused Placeholder Variable (Code Quality - LOW)

**Problem:** `SocialProofBar.tsx` still has `const placeholderLogos = ['Brand A', 'Brand B', ...]` on line 10, even though it's no longer rendered. This is dead code that could confuse future developers.

**Fix:** Remove the unused `placeholderLogos` variable.

**File:** `src/components/landing/SocialProofBar.tsx`

---

### ISSUE 5: Product Grid Edit/Delete Buttons Not Tappable on Mobile (UX - MEDIUM)

**Problem:** On the Products page, the edit and delete buttons on product cards only appear on hover (`opacity-0 group-hover:opacity-100`). On mobile/touch devices, there's no hover state, so users can't access edit/delete from the grid view. They have to switch to list view, which also uses hover-based button visibility.

**Fix:** Make the action buttons always visible on mobile using the `useIsMobile` hook, similar to what was done for `ProductImageGallery`.

**File:** `src/pages/Products.tsx`

---

### ISSUE 6: `check-subscription` Called 3+ Times on Every Page Load (Performance - MEDIUM)

**Problem:** Looking at the network requests, `check-subscription` is called 3 times simultaneously on every page load. The `CreditContext` calls it, and it appears other components also trigger it. Each call is a paid edge function invocation.

**Fix:** Add a deduplication mechanism -- either a `useRef` flag to prevent concurrent calls, or consolidate to a single call triggered by `CreditContext` and consumed by all components via context.

**File:** `src/contexts/CreditContext.tsx`

---

### ISSUE 7: Duplicate Profile/Credit Queries on Page Load (Performance - LOW)

**Problem:** The network logs show `profiles` table being queried 4+ times simultaneously (onboarding check x2, credit fetch x2). The `ProtectedRoute` and `CreditContext` independently query the same table.

**Fix:** Consolidate the profile query into a single provider that shares the data, or use React Query's built-in deduplication by ensuring the same `queryKey` is used everywhere.

**Files:** `src/components/app/ProtectedRoute.tsx`, `src/contexts/CreditContext.tsx`

---

### Summary Table

| # | Priority | Issue | Impact |
|---|----------|-------|--------|
| 1 | HIGH | No password reset flow | Users locked out permanently |
| 2 | HIGH | Email signup redirects to `/` not `/app` | Broken post-signup flow |
| 3 | HIGH | Contact form doesn't save data | Lost enterprise leads |
| 4 | LOW | Dead placeholder variable in SocialProofBar | Code cleanliness |
| 5 | MEDIUM | Product cards not tappable on mobile | Can't edit/delete products on phone |
| 6 | MEDIUM | `check-subscription` called 3x per page load | Unnecessary edge function costs |
| 7 | LOW | Duplicate profile queries on load | Minor performance waste |

### What's Working Correctly

- OAuth redirect to `/app` (Google + Apple) -- confirmed fixed
- Landing page auto-redirects logged-in users to `/app`
- Onboarding page blocks unauthenticated users
- All "20 free credits" text is consistent
- CompetitorComparison uses proper labels
- SocialProofBar no longer shows fake brand logos
- Product edit modal uses Drawer on mobile
- Image reorder works with tap arrows on mobile
- RLS policies are properly scoped on all tables
- Edge functions validate JWT tokens
- 404 page is functional
- Footer links all route correctly
- Mobile navigation works with hamburger menu

