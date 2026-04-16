

# Typography & Visual Rhythm Cleanup — Pricing Cards (Final Polish)

## Problem
Cards still have slightly random text sizes, weak header hierarchy, disconnected supporting text, and compressed spacing. The modal reads like a structured table rather than three clean premium offers.

## Changes

### Both files: `BuyCreditsModal.tsx` and `NoCreditsModal.tsx`

**1. Fix header hierarchy (BuyCreditsModal lines 132-157)**
- Title: `text-xl font-bold` — `{balance} credits remaining` (keep as-is)
- Subtitle: `text-sm text-muted-foreground` — `Choose a plan to keep creating` (keep as-is)
- Replace "Better value on larger plans" (line 307-309) with: **"Scale faster with more credits and better value per image"** — move it right under the subtitle in the header area (not floating separately below). Use `text-xs text-muted-foreground` for this line.
- Remove the gap between header and content — tighten `pb-4` to `pb-3` on header.

**2. Tighten billing toggle placement**
- Reduce `space-y-4` on the plans container to `space-y-3` so toggle sits closer to cards.
- Remove the separate contextual subtitle `<p>` for free users (line 306-310) — it's now in the header.

**3. Card typography — strict 4-level system**

| Level | Style | Used for |
|-------|-------|----------|
| A | `text-lg font-semibold` | Plan name (bump from `text-base font-bold`) |
| B | `text-3xl font-bold` + `/mo` at `text-lg font-medium` | Price (bump from `text-2xl` + `text-base`) |
| C | `text-sm text-muted-foreground` | Metrics (images, credits, price-per-credit) — already correct |
| D | `text-xs text-muted-foreground` | Descriptor, billing note, bullets |

Key changes:
- Plan name: `text-base font-bold` → `text-lg font-semibold` (stronger anchor)
- Price: `text-2xl font-bold` → `text-3xl font-bold` (dominant visual element)
- `/mo`: `text-base font-medium` → `text-lg font-medium` (less fragmented)
- Price-per-credit: keep `text-sm text-primary font-semibold` (consistent with other metrics but emphasized)

**4. Increase vertical spacing between card zones**
Current `mb-4` / `mb-5` is close but needs refinement:
- Zone 1 (name + descriptor): `mb-5` (was `mb-4`)
- Zone 2 (price + billing): `mb-6` (was `mb-5`)
- Zone 3 (metrics): `mb-6` (was `mb-5`)
- Zone 4 (differentiators): `flex-1 mb-4` (keep)
- Zone 5 (CTA): `pt-4 mt-auto` (keep)

**5. Growth card refinement**
- Border: `border-primary/60` (soften from `border-primary/70`)
- Background: keep `bg-primary/[0.03]`
- Shadow: `shadow-lg shadow-primary/5` (slightly elevated)
- Badge text: `text-[10px]` (was `text-[9px]` — normalize up)

**6. Footer cleanup**
- Reassurance line: bump from `text-[11px]` to `text-xs` (readable, not tiny)
- Footer links: keep `text-xs` but ensure consistent spacing

**7. NoCreditsModal FreePlanSection**
- Same card typography changes (plan name, price, metrics sizing)
- Same spacing adjustments
- Subtitle line 77-79: change to "Scale faster with more credits and better value per image"

### Also apply to `UpgradeValueDrawer.tsx`
- Same typography scale for plan name, price, metrics inside drawer cards

## Files Changed

| File | Change |
|------|--------|
| `BuyCreditsModal.tsx` | Header hierarchy fix, move supporting line up, bump plan name/price sizes, increase card zone spacing, soften Growth border, normalize footer text |
| `NoCreditsModal.tsx` | Same card typography and spacing changes in FreePlanSection, update subtitle copy |
| `UpgradeValueDrawer.tsx` | Align card typography to same 4-level system |

