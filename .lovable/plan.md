

## Goal
Align the public `/pricing` page (`LandingPricing.tsx`) with the strongest patterns from the in-app `/app/pricing` page (`AppPricing.tsx`), so a logged-out visitor understands plans within 3–5 seconds and can scan a clear comparison table — without redesigning the whole page.

## Analysis: What `/app/pricing` does better
1. **Side-by-side feature matrix** — 5 grouped categories (Generation, Video, Quality, Brand & workflow, Account) with check/dash cells. Public page lacks this entirely.
2. **Compact plan column headers** with Recommended ribbon, price, credits, annual savings, CTA — all above the comparison.
3. **Trust microcopy** ("Cancel anytime · No commitment · Secure checkout").
4. **Mobile pattern**: stacked cards + collapsible "See all features" per plan (vs. public page's static cards with no comparison).
5. **Tighter typography hierarchy** (semibold vs extrabold, smaller credit/per-credit lines).

## What public `/pricing` does well (keep)
- Hero header + billing toggle with `-20%` badge ✓
- 4 plan cards above the fold ✓
- Team comparison table (more detailed than app version — keep) ✓
- Platform features grid (12 icons) — public-only, valuable for discovery ✓
- CompetitorComparison bar chart ✓
- "How credits work" + FAQ + Start Free CTA + Enterprise banner ✓

These are public-audience strengths and don't exist in `/app/pricing`. Keep them.

## Changes (single file: `src/components/landing/LandingPricing.tsx`)

### 1. Add a "Compare every feature" section (NEW — between plan cards and Team Comparison)
Port the `FEATURE_MATRIX` constant + `renderCell` helper from `AppPricing.tsx` (5 groups, ~22 rows). Render:

- **Desktop (`md:block`)**: full table with sticky-style column headers showing plan name + price + credits + Recommended ribbon on Growth + CTA button per column. Reuse the same compact header style from `AppPricing` lines 387–450. CTAs route to `/auth` for logged-out users (or `/app/settings` for logged-in, mirroring existing public card logic).
- **Mobile (`md:hidden`)**: per-plan collapsible "See all features" using `Collapsible`, mirroring `AppPricing` lines 556–588.

This is the **core ask**: an easy-to-scan comparison.

### 2. Tighten plan-card pricing block (small alignment fix)
In the existing 4 plan cards (lines 113–222), match the tighter `/app/pricing` hierarchy:
- Add `≈ X images` line already exists ✓
- Per-credit price line already exists ✓
- No structural changes — just verify Growth's "Recommended" badge wording matches (`/app/pricing` uses "Recommended", public uses `plan.badge` from data — confirm `pricingPlans` Growth badge says "Recommended" or "Most Popular" — leave as-is if data-driven).

### 3. Add trust microcopy under plan cards
Insert directly under the 4 plan cards grid (before Team Comparison):
```
Cancel anytime · No commitment · Secure checkout
```
Single muted line, centered. Matches `/app/pricing` trust block (lines 595–601).

### 4. Re-order sections for 3–5 second scannability
Current order: Cards → Team comparison → Platform features → Cost comparison → Credits → FAQ → CTA → Enterprise.

New order:
1. Header + toggle
2. **Plan cards** (4) + trust line
3. **NEW: Compare every feature** (full matrix) ← *the core add*
4. Team comparison ("replaces your creative team")
5. Platform features grid
6. Cost comparison (CompetitorComparison)
7. How credits work
8. FAQ
9. Start Free CTA
10. Enterprise banner

Rationale: feature matrix immediately follows the cards so a scanning user sees pricing → "what do I get at each tier" in one flow.

### 5. Pricing/credits consistency check
Both pages already import from the same `pricingPlans` source in `src/data/mockData.ts`, so monthly prices, annual prices, credits, and features are already in sync. **No data changes needed.** Verified: Free 20 cr, Starter 500, Growth 1,500, Pro 4,500.

The only mismatch is the FAQ copy (public says credits are 6 for Templates / 4 for Freestyle; app says ~4–6 average). Align public FAQ answer to app's wording for consistency.

## Out of scope (per "no major redesigns")
- Sticky bottom plan-selector bar (in-app pattern; not needed for public visitors who haven't picked a plan yet).
- Plan-change dialog (logged-in only).
- Replacing the existing public Team Comparison or Platform Features (these are public-page strengths).
- Pricing values, credit allocations, plan IDs.

## Files
- `src/components/landing/LandingPricing.tsx` — add `FEATURE_MATRIX` constant + `renderCell` helper, add desktop comparison table section, add mobile collapsible feature lists per plan card, add trust microcopy line, reorder sections, align one FAQ answer.

## Result
- New visitors see a clear scan path: cards → instant feature comparison → social/savings proof → details.
- Pricing & features stay consistent (single data source).
- Mobile users get the same comparison via collapsibles, no extra scrolling burden.
- No redesigned components, no broken existing flows, no data migrations.

