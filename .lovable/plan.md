

# Pricing Popup — Final Refinement (Cleaner, Shorter, Premium)

## Problem
Cards still have too much text density — "Billed monthly" lines, long descriptors, inconsistent spacing. The popup reads like a pricing table rather than 3 clean offers.

## Changes

### File: `src/components/app/BuyCreditsModal.tsx`

**1. Header (lines 134-143)**
- Remove the third line "More credits = lower cost per image" — keep only:
  - `You're out of credits` (text-xl font-bold)
  - `Pick a plan to keep creating` (text-sm text-muted-foreground)

**2. Card descriptors (lines 376-380)**
- Shorten to: `starter: 'Best to start'`, `growth: 'Best value'`, `pro: 'For scale'`

**3. Remove "Billed monthly/annually" line (lines 456-458)**
- Delete the `<p>Billed annually/monthly</p>` line from the price block

**4. Bullet text (lines 386-399)**
- Shorten: `growth: 'Faster generation'` (drop "queue"), `pro: 'Fastest generation'` (drop "queue")

### File: `src/components/app/NoCreditsModal.tsx`

**5. Descriptors (lines 23-27)**
- Same: `starter: 'Best to start'`, `growth: 'Best value'`, `pro: 'For scale'`

**6. Subtitle (line 77-79)**
- Change to `Pick a plan to keep creating`

**7. Remove "Billed monthly/annually" (lines 153-155)**
- Delete from price block

**8. Bullet text (lines 41-53)**
- Same shortening: drop "queue" from generation bullets

**9. Remove `PLAN_VALUE_LABELS` usage (lines 29-33, 115)**
- Remove the unused value labels dict and any reference

### File: `src/components/app/UpgradeValueDrawer.tsx`

**10. Same descriptor + bullet shortening** if present in drawer cards

## Summary of copy changes

| Element | Before | After |
|---------|--------|-------|
| Header line 3 | "More credits = lower cost per image" | Removed |
| Growth descriptor | "Most popular for consistent content" | "Best value" |
| Pro descriptor | "Best for high-volume production" | "For scale" |
| Billed line | "Billed monthly" / "Billed annually" | Removed |
| Growth bullet | "Faster generation queue" | "Faster generation" |
| Pro bullet | "Fastest generation queue" | "Fastest generation" |
| NoCredits subtitle | "Choose a plan to keep creating" | "Pick a plan to keep creating" |

## Files Changed

| File | Change |
|------|--------|
| `BuyCreditsModal.tsx` | Remove header line 3, shorten descriptors, remove billed line, shorten bullets |
| `NoCreditsModal.tsx` | Same descriptor/bullet/billing changes, update subtitle |
| `UpgradeValueDrawer.tsx` | Align descriptors and bullets |

