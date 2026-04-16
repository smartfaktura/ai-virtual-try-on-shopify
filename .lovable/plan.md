

# Typography & Hierarchy Cleanup — Pricing Cards

## Problem
Cards use ~11 different text sizes/weights creating visual noise. The `/mo` is too small, metrics mix with value badges, and vertical spacing is too compressed. Feels like a dashboard widget, not a premium offer.

## Changes

### Both files: `BuyCreditsModal.tsx` (Plans tab cards, lines 420-519) and `NoCreditsModal.tsx` (FreePlanSection cards, lines 119-205)

**1. Fix price block — `/mo` on same line, proper size**
```
$39/mo          ← price: text-2xl font-bold, /mo: text-base font-medium (not text-xs)
Billed monthly  ← text-xs text-muted-foreground
```
Remove the `items-baseline gap-1` flex approach. Use inline text instead so `/mo` feels connected.

**2. Clean metrics block — 3 uniform lines, no badges**
Remove the inline value pill (`Better than Free` / `Better value` / `Best value`) from the metrics area entirely. Replace with 3 clean lines at consistent `text-sm` size:
```
~100 images / month
500 credits / month
$0.078 per credit
```
All `text-sm text-muted-foreground`, with price-per-credit in `text-primary` for emphasis. No badges, no pills.

**3. Increase vertical spacing between card zones**
Four clear zones with `mb-4` or `mb-5` gaps:
- Zone 1: Plan name + descriptor (`mb-4`)
- Zone 2: Price + billing note (`mb-5`)
- Zone 3: Metrics — 3 lines (`mb-5`)
- Zone 4: Bullets + CTA (`flex-1` + `mt-auto`)

Current `mb-3` everywhere is too compressed.

**4. Quiet the bullets**
Keep `text-xs text-muted-foreground` (not `text-[11px]`). Consistent with metrics size but visually lighter.

**5. Refine Growth card border**
Change from `border-primary` to `border-primary/70` — still clearly highlighted but not heavy.

**6. Clean header in BuyCreditsModal (lines 132-157)**
Keep current text but ensure only 3 levels:
- `text-xl font-bold` — balance line
- `text-sm text-muted-foreground` — subtitle
- `text-xs text-muted-foreground` — "Better value" line (already exists, just ensure spacing is clean)

### Typography Scale (4 levels only inside cards)

| Level | Usage | Style |
|-------|-------|-------|
| A | Plan name | `text-base font-bold` |
| B | Price | `text-2xl font-bold` + `/mo` at `text-base font-medium` |
| C | Metrics | `text-sm text-muted-foreground` |
| D | Descriptor, bullets, billing | `text-xs text-muted-foreground` |

## Files Changed

| File | Change |
|------|--------|
| `BuyCreditsModal.tsx` | Flatten price block, remove value pills, uniform metrics, increase card padding |
| `NoCreditsModal.tsx` | Same card typography cleanup in FreePlanSection |

