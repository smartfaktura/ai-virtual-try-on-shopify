

# Polish Pricing Popup — Premium Offer Cards

## Problem
Plan cards still have a box-inside-box layout (inner gray metrics panel), the billing toggle floats away from the cards it controls, the header lacks hierarchy, and overall spacing doesn't feel premium.

## Changes

### File: `src/components/app/BuyCreditsModal.tsx` — Plans tab

**1. Restructure header (lines 132-165)**
- Remove the wallet icon box and plan badge from the top bar
- Replace with a clean text hierarchy:
  - `{balance} credits remaining` (bold)
  - `Choose a plan to keep creating` (subtitle)
  - `Better value on larger plans` (muted line)
- Keep close button top-right

**2. Move billing toggle (lines 167-217)**
- Remove the billing toggle from the tab-switcher row
- Place it directly above the plan cards grid, centered, within the Plans tab content area
- Structure becomes: header → subtitle → billing toggle → cards

**3. Flatten plan cards (lines 428-529)**
- Remove the inner `rounded-xl bg-muted/60 border` metrics container (lines 482-501)
- Place credits, images, price-per-credit directly in the card body as simple text lines:
  - `500 credits / month` — text-sm
  - `~100 images` — text-xs muted
  - `$0.078 per credit` — text-xs primary with value label badge inline
- Keep only 2 differentiator bullets below
- Add `pt-3` before CTA for breathing room

**4. Refine Growth card styling**
- Use `border-primary/80` (not full `border-primary`) for a cleaner highlight
- Keep `bg-primary/[0.03]` and `shadow-md shadow-primary/5`
- "Most Popular" badge stays

**5. Add reassurance line**
Already exists at bottom — keep as-is

### File: `src/components/app/NoCreditsModal.tsx` — FreePlanSection

**Same card restructuring:**
- Remove the inner `rounded-xl bg-muted/60` metrics container (lines 159-176)
- Flatten metrics into card body directly
- Keep billing toggle centered above cards (already in correct position)
- Same spacing improvements

## Card Layout (both files)

```text
┌─────────────────────┐
│ Growth               │
│ Best value for       │
│ growing brands       │
│                      │
│ $79/mo               │
│ billed monthly       │
│                      │
│ 1,500 credits/mo     │
│ ~300 images           │
│ $0.053/credit ▸Better│
│                      │
│ ✓ Faster queue       │
│ ✓ Brand Models NEW   │
│                      │
│ [  Get Growth     ]  │
└─────────────────────┘
```

No inner panel. Clean flat hierarchy.

## Files Changed

| File | Change |
|------|--------|
| `BuyCreditsModal.tsx` | Flatten header, move toggle above cards, remove inner metrics box, improve spacing |
| `NoCreditsModal.tsx` | Remove inner metrics box in FreePlanSection, same flat card layout |

