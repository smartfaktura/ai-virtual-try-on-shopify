

## Fix: Dot Indicators Not Tracking Scroll Position

### Problem
The dot indicators in the hero carousel don't update when scrolling because the scroll-to-dot-index calculation uses a hardcoded `itemWidth = 196` (line 186), but actual items are `155px wide + 10px gap = 165px`. The dot click handler also uses a different wrong value (`168`, line 336).

### Fix

**File: `src/components/landing/HeroSection.tsx`**

1. **Line 186** — Change `itemWidth` from `196` to `165` (matching `w-[155px]` + `gap-2.5` = 10px)
2. **Line 336** — Change dot click scroll offset from `i * 168` to `i * 165`

Both values must match the real rendered item width for dot tracking and dot-click navigation to work correctly.

### Files to edit
- `src/components/landing/HeroSection.tsx` (2 line changes)

