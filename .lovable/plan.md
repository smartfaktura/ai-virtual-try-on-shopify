

# Fix Share Links to Use Production Domain

## Problem
Share URLs use `window.location.origin` which returns the preview/dev domain instead of `https://vovv.ai`. This affects both copy link and social share (WhatsApp, Twitter, Facebook).

## Changes

### 1. `src/components/app/PublicDiscoverDetailModal.tsx` (line 199)
- Import `SITE_URL` from `@/lib/constants`
- Change `url={`${window.location.origin}/discover`}` → `url={`${SITE_URL}/discover`}`

### 2. `src/components/app/DiscoverDetailModal.tsx` (line 427)
- Import `SITE_URL` from `@/lib/constants`
- Change `url={`${window.location.origin}/discover`}` → `url={`${SITE_URL}/discover`}`

### Files
- `src/components/app/PublicDiscoverDetailModal.tsx`
- `src/components/app/DiscoverDetailModal.tsx`

