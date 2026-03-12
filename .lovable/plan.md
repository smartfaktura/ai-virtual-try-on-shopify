

## Compact Mobile Hero — Horizontal Scroll Strip

### Problem
The 2-column, 6-card grid with 3:4 aspect ratios takes ~3 full screens of vertical space on mobile — pushing the CTA and all content far below the fold. Terrible for conversion.

### Solution — Compact horizontal strip
Replace the grid with a tight, single-row horizontal scroll showcase that fits entirely within ~200px of vertical space:

1. **Small product thumbnail** (56×75px) on the left with "Your Upload" label below
2. **Arrow icon** → visual separator
3. **Horizontal scroll strip** of 4-5 output thumbnails (aspect 3:4, ~120px tall) with scene labels overlaid
4. **Scene switcher pills + caption** below in a single line

This keeps the "1 photo → many outputs" story but uses ~200px vertical space instead of ~900px.

### Changes — `src/components/landing/HeroSection.tsx` (lines 249-313)

Replace the entire mobile grid block with:

```text
┌─────────────────────────────────────┐
│ [Upload] → [Out1][Out2][Out3][Out4] │  ~130px tall
│  56×75       scrollable strip       │
├─────────────────────────────────────┤
│   [Crop Top] [Serum] [Ring]         │  pills
│   "Same top ∞ environments"         │  caption
└─────────────────────────────────────┘
```

- Outer container: `flex md:hidden flex-col items-center gap-3`
- Top row: `flex items-center gap-2 w-full overflow-x-auto`
  - Product: 56×75px rounded-lg with "Your Upload" text below, flex-shrink-0
  - Arrow: small `→` or `ChevronRight` icon
  - Outputs: `flex gap-2`, each card ~100px wide, aspect-[3/4], flex-shrink-0, with scene label overlay
- Scrollbar hidden via `scrollbar-hide` or `-webkit-scrollbar: none`
- Scene pills + caption remain below, unchanged

This keeps everything above the fold and feels like a premium app showcase.

