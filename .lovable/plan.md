

# Compact Mobile Dashboard

## Problem
The returning user dashboard has excessive whitespace on mobile — large section gaps, tall metric cards, and oversized heading text waste vertical space, pushing content below the fold (visible in the screenshot: 4 metric cards + quick actions fill the entire screen).

## Changes

### File: `src/pages/Dashboard.tsx`

**1. Reduce outer spacing on mobile**
- Line 508: `space-y-8 sm:space-y-10` → `space-y-5 sm:space-y-10`

**2. Shrink welcome heading on mobile**
- Line 512: `text-3xl sm:text-4xl` → `text-2xl sm:text-4xl`
- Line 515-516: `text-lg` → `text-sm sm:text-lg`, add `mt-1 sm:mt-2`

**3. Tighten quick actions row**
- Line 519: `mt-5` → `mt-3 sm:mt-5`

**4. Reduce metric grid gap on mobile**
- Line 551: `gap-3 sm:gap-4` → `gap-2 sm:gap-4`

### File: `src/components/app/MetricCard.tsx`

**5. Compact card height on mobile**
- Line 53 (loading skeleton): `h-[120px] sm:h-[140px]` → `h-[100px] sm:h-[140px]`, reduce padding `p-2.5 sm:p-5`
- Line 65 (card content): `h-[120px] sm:h-[140px]` → `h-[100px] sm:h-[140px]`, padding `p-2.5 sm:p-5`
- Line 71: icon `w-3 h-3` on mobile, title text stays `text-[10px]`
- Line 75: value `text-base sm:text-xl`, reduce `mt-1.5 sm:mt-2`

These changes save ~80-100px of vertical space on the metric row alone, plus ~40px from tighter section gaps and heading, bringing more content above the fold.

### Files
- `src/pages/Dashboard.tsx` — spacing, heading size
- `src/components/app/MetricCard.tsx` — compact card height and padding on mobile

