

# Fix Footer Spacing — Less Mashed Up

## Problem
The footer area (Cancel anytime → inclusion line → links) is cramped with `space-y-2` and all text at `text-xs`, making it feel like one dense block.

## Changes

### File: `src/components/app/BuyCreditsModal.tsx` (lines 503-525)

**Increase vertical spacing and add visual separation:**

- Change outer container from `space-y-2 pt-1` → `space-y-3 pt-4` (more breathing room from cards + between lines)
- Add a subtle top border: `border-t border-border/30` to visually separate footer from cards
- "Cancel anytime · No commitment" — bump to `text-[13px]` so it reads as a reassurance headline, not fine print
- "All paid plans include..." — keep `text-xs`, add `mt-1` to space it slightly from the reassurance line
- Links row — add `pt-1` for extra gap before links

### File: `src/components/app/NoCreditsModal.tsx`
- Apply same spacing and border changes to matching footer section

## Result
Three visually distinct tiers: reassurance → inclusion → links, each with clear breathing room instead of one dense text block.

