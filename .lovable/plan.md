

## Goal

Make the credits indicator feel more premium by increasing the visual weight of the icon, balance number, and "Upgrade/Top up" CTA.

## Changes in `src/components/app/CreditIndicator.tsx`

### 1. Bigger icon
- `Sparkles`: `w-4 h-4` → `w-[18px] h-[18px]`
- Slightly stronger stroke: `1.75` → `2`
- Color stays `text-sidebar-foreground/80`

### 2. Bigger balance number
- Balance: `text-sm font-bold` → `text-base font-semibold` (16px, slightly tighter weight reads more premium than bold)
- "/ max": `text-[10px]` → `text-[11px]`, keep muted color

### 3. Bigger CTA pill
- Height: `h-7` → `h-8`
- Padding: `px-3` → `px-3.5`
- Text: `text-[11px]` → `text-xs` (12px), keep `font-semibold`
- Keep the white pill + animated shimmer overlay

### 4. Spacing tweaks
- Icon ↔ number gap: `gap-2` stays
- Slightly increase row vertical breathing inside the card: `space-y-2.5` → `space-y-3`
- Outer card padding: `p-3.5` stays

No logic changes. No layout restructure. Only sizing/weight refinement.

## Expected result

The credits row reads with more presence in the sidebar — clearer balance, more confident CTA — while staying within the "luxury restraint" aesthetic.

