

# Lighter Modal Background + Premium Card Shadows

## Problem
The `bg-muted` background on both modals is too dark/gray, making the whole popup feel heavy. Cards need more definition via shadows and borders for a premium feel.

## Changes

### 1. Lighten modal background (both files)
- Change `bg-muted` → `bg-background` on `DialogContent` in both `BuyCreditsModal.tsx` (line 130) and `NoCreditsModal.tsx` (line 403)

### 2. Improve card shadows for premium feel
Add stronger shadow treatment to plan cards:
- **BuyCreditsModal plans tab** (line ~426): add `shadow-sm` to non-highlighted cards, keep `shadow-md` on highlighted
- **BuyCreditsModal credit packs** (line ~206): add `shadow-sm` to regular packs
- **NoCreditsModal cards** (line ~129): add `shadow-sm` to regular cards

### 3. Keep both buttons
"Compare all features" and "Contact Sales" both remain untouched.

## Files
- `src/components/app/BuyCreditsModal.tsx`
- `src/components/app/NoCreditsModal.tsx`

