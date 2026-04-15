

# QA Design Audit — Post-Gen Conversion (Round 3)

## Bug Found

### Bug 1: `!sm:max-w-[480px]` is invalid Tailwind — drawer width override is broken

**Root cause**: Tailwind's important modifier `!` goes *before the utility name*, not before the responsive prefix. The correct syntax is `sm:!max-w-[480px]`, not `!sm:max-w-[480px]`.

**Impact**: The class is silently ignored. The Sheet base variant `sm:max-w-sm` (384px) wins on desktop/tablet. The drawer is 96px narrower than intended (384px instead of 480px). Plan cards and content feel cramped on desktop.

**Fix**: Change `!sm:max-w-[480px]` to `sm:!max-w-[480px]` on line 45 of `UpgradeValueDrawer.tsx`.

### Bug 2: Layer 1 chip badges still `text-[10px]` on mobile

The previous audit fixed Layer 2 chips to `text-[11px] sm:text-[10px]` for mobile readability, but Layer 1 chips in `PostGenerationUpgradeCard.tsx` (line 59) were left at `text-[10px]` across all breakpoints. Same readability problem — 10px text on a phone is below comfortable reading size.

**Fix**: Change `text-[10px]` to `text-[11px] sm:text-[10px]` on the Badge className in `PostGenerationUpgradeCard.tsx` line 59.

### Bug 3: NoCreditsModal close button overlaps "Best Value" badge

The Dialog base positions its close X at `absolute right-4 top-4`. The modal uses `p-0 gap-0`, so the close button sits at pixel (16, 16) — right on top of the gradient header. This is visually acceptable. However, the "Best Value" badge on credit packs uses `absolute -top-3` and the grid has `mt-3` to compensate. On mobile (single column), the first pack card's badge is fine. But on desktop `sm:grid-cols-3`, if the popular pack is not the first item, the badge of whichever pack is popular clips against the grid gap. The `mt-3` is on the grid wrapper, not on individual cards.

**Fix**: Move `mt-3` from the grid `div` to each individual pack card via `pt-4` on cards that have `pack.popular`, or add `overflow-visible` to the grid.

## Summary of changes

| File | Fix |
|------|-----|
| `UpgradeValueDrawer.tsx` line 45 | `!sm:max-w-[480px]` → `sm:!max-w-[480px]` |
| `PostGenerationUpgradeCard.tsx` line 59 | `text-[10px]` → `text-[11px] sm:text-[10px]` |
| `NoCreditsModal.tsx` line 50 | Remove `mt-3` from grid, add `pt-4` to popular pack card for badge clearance |

