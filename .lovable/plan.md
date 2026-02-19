

## Pre-Launch Audit: Issues Found and Fixes

After testing all pages, checking security policies, storage configuration, edge functions, and database setup, here are the findings:

### Status: What's Working Well
- All app pages render correctly (Dashboard, Products, Workflows, Creative Drops, Discover, Library, Freestyle, Settings, Generate)
- Landing page looks polished with proper carousel and CTA
- Product cards display nicely with proper title wrapping and badge truncation
- Empty states are clean and helpful (Library, Creative Drops)
- New user trigger (`on_auth_user_created`) is active and creates profiles with 20 credits
- All storage buckets are correctly configured (public/private as intended)
- No JavaScript console errors in the app
- RLS policies are properly scoped for all user data tables

---

### Issue 1: Edge Functions Have No JWT Gate (Security - Medium)

**Problem:** All 18+ edge functions in `supabase/config.toml` have `verify_jwt = false`. While many functions do manual JWT parsing internally (e.g., `getUserIdFromJwt`), some functions like `describe-image`, `create-model-from-image`, `create-scene-from-image`, `analyze-product-image`, and `studio-chat` don't appear to verify the caller at all. This means anyone with your API URL can call these functions and consume your AI API credits.

**Fix:** For functions that already do internal auth checking (like `enqueue-generation`, `generate-video`, `trigger-creative-drop`, `retry-queue`, `generate-freestyle`), enable `verify_jwt = true` in `config.toml`. For functions that need to be called without auth (like `mobile-upload` which uses session tokens, or `process-queue` which is internal), keep `verify_jwt = false` but add rate limiting or internal secret checks.

**Files:** `supabase/config.toml`, plus adding auth checks to unprotected edge functions

---

### Issue 2: Leaked Password Protection Disabled (Security - Low)

**Problem:** The database linter flagged that leaked password protection is disabled. This means users can sign up with passwords that have appeared in known data breaches.

**Fix:** Enable leaked password protection in the authentication settings. This is a configuration change, not a code change.

---

### Issue 3: `generated_videos` Service Role Policy (Security - Informational)

**Problem:** The linter flagged the "Service role can manage all videos" RLS policy with `USING (true)`. However, this policy is scoped to the `service_role` role only, which is only available server-side. This is actually safe and intentional -- edge functions need service role access to update video status.

**Fix:** No code change needed. This is a false positive from the linter.

---

### Issue 4: Landing Page Says "5 free visuals" But Users Get 20 Credits (Content - Low)

**Problem:** The landing page hero section shows "5 free visuals" in the social proof bar, but new users actually receive 20 credits. This is misleading (in the user's favor, but still inconsistent).

**Fix:** Update the landing page text to match the actual credit allocation, or adjust to say "20 free credits" / "Up to 20 free visuals".

**File:** `src/components/landing/HeroSection.tsx`

---

### Recommended Fix Priority

1. **Issue 1** (Edge function auth) -- Should be addressed before launch to prevent credit abuse
2. **Issue 4** (Landing page text) -- Quick fix for consistency  
3. **Issue 2** (Password protection) -- Configuration change via backend settings
4. **Issue 3** -- No action needed

### Technical Implementation

**For Issue 1 (Edge Function Auth):**
- Update `supabase/config.toml` to set `verify_jwt = true` for functions that already do internal auth
- Add auth header validation to unprotected functions (`describe-image`, `create-model-from-image`, `create-scene-from-image`, `analyze-product-image`, `studio-chat`) that call external AI APIs
- Keep `verify_jwt = false` only for truly public endpoints (`mobile-upload`, `process-queue`, `import-product`)

**For Issue 4 (Landing Text):**
- Change "5 free visuals" to "20 free credits" in `HeroSection.tsx`

