

# Remaining Home Page Fixes

## 1. Fix ref warning in FinalCTA / TeamAvatarHoverCard (BUG)

Console shows: `Function components cannot be given refs. Did you mean to use React.forwardRef()?`

**Root cause**: `HoverCardTrigger` uses `asChild` which passes a ref to its child. In `FinalCTA`, the child is a `<ShimmerImage>` — but `ShimmerImage` is already `forwardRef`. The actual problem is `TeamAvatarHoverCard` itself is a function component that doesn't forward refs, and it's being used inside contexts that attempt to assign refs.

**Fix**: Wrap `TeamAvatarHoverCard` with `React.forwardRef` so `HoverCardTrigger asChild` can attach its ref properly.

**File**: `src/components/landing/TeamAvatarHoverCard.tsx`

---

## 2. Preload font-weight 800 (font-extrabold) for hero h1

The font preload in `index.html` line 22 loads a single woff2 file that covers the Inter variable range, but the Google Fonts CSS (line 53) only requests weights `300;400;500;600`. The hero h1 uses `font-extrabold` (weight 800), which is not included — causing a FOUT/fallback for the most prominent text on the page.

**Fix**: Update the Google Fonts request to include weight 800: `wght@300;400;500;600;800`.

**File**: `index.html` — lines 22 and 53

---

## 3. `LandingNav` eagerly imports `useAuth` — pulls Supabase into critical path

`LandingNav` is NOT lazy-loaded (imported eagerly in `Landing.tsx` line 2). It imports `useAuth`, which imports `supabase` client, which imports `@supabase/supabase-js`. This adds the entire Supabase SDK to the critical render path.

**Impact**: Low-medium. The Supabase client is already initialized by `AuthProvider` in `App.tsx`, so the module is loaded regardless. No fix needed — just noting for awareness.

---

## Summary

| # | Fix | Impact | Effort |
|---|-----|--------|--------|
| 1 | Fix TeamAvatarHoverCard ref warning | Medium (console noise + potential hover bugs) | Low |
| 2 | Add font-weight 800 to Google Fonts request | Medium (FOUT on hero heading) | Low |

Two files, two small changes. Everything else on the landing page is well-optimized.

