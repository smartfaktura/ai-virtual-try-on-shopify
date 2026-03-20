

# Fix Remaining Audit Issues (3 items)

## 1. Add 5 missing feature pages to sitemap
**File:** `public/sitemap.xml`
Add URLs for: `/features/ai-models-backgrounds`, `/features/shopify-image-generator`, `/features/upscale`, `/features/perspectives`, `/features/real-estate-staging`

## 2. Fix robots.txt mobile upload path
**File:** `public/robots.txt`
Change `Disallow: /mobile-upload` → `Disallow: /upload/` (in all 3 user-agent blocks)

## 3. Fix hardcoded credits in Onboarding Resend sync
**File:** `src/pages/Onboarding.tsx` line 117
Change `credits_balance: 20` → `credits_balance: 60`

## 4. Fix resendTimer initial value
**File:** `src/pages/Auth.tsx` line 38
Change `useState(60)` → `useState(30)`

4 small edits across 4 files.

