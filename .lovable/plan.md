

# Simplify Value Drawer — Fit Everything in One Screen

## Problem
The drawer has 4 heavy sections (header, unlock block, "why brands upgrade" grid, 3 plan cards + compare link) that overflow the viewport. Too much text, too many visual styles, too many separators. It should be a clean, single-screen decision surface — not a sales brochure.

## Strategy
Merge sections 2 and 3 into the header area as a compact subline. Remove separators. Compress plan cards into a tighter single-row-per-plan layout. The entire drawer should fit in one viewport (~700px) on desktop without scrolling.

## File: `src/components/app/UpgradeValueDrawer.tsx`

### Remove Section 2 ("What You Unlock") entirely
The "Select from 1,000+ personalized editorial shots" + chips section takes ~120px. Move the key message into the header subline instead:
- Subline becomes: `{copy.subline} · 1,000+ editorial shots · Monthly campaign drops`

### Remove Section 3 ("Why brands upgrade") entirely  
The 2×2 grid with 4 icon rows is redundant — the plan cards already show credits, pricing, and features. Cut it completely.

### Remove all `<Separator />` components
They add visual weight and vertical space. The sections are clear enough without them.

### Compress plan cards
- Remove the `positioning` text line under each plan (saves ~20px per card)
- Make each card a single horizontal row: `[Name + price] [credits badge + ¢/cr] [CTA button]`
- Reduce card padding from `p-3.5` to `p-3`
- Keep the "Recommended" badge on Growth
- Keep full-width CTA only for the recommended plan; other plans get a compact inline button

### Result layout (single viewport):

```text
┌─────────────────────────────────────────┐
│ [av] Scale your fashion visual library  │
│      From 1 direction to a full         │
│      campaign-ready collection          │
│                                         │
│  Choose your plan                       │
│  ┌─────────────────────────────────┐    │
│  │ Starter  $39/mo  500cr  7.8¢/cr│    │
│  │         [Get Starter →]        │    │
│  └─────────────────────────────────┘    │
│       ── RECOMMENDED ──                 │
│  ┌─────────────────────────────────┐    │
│  │ Growth  $79/mo  1,500cr  5.3¢/cr│   │
│  │         [👑 Get Growth]         │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ Pro  $179/mo  4,500cr  4.0¢/cr │    │
│  │         [Get Pro →]            │    │
│  └─────────────────────────────────┘    │
│         Compare all plans →             │
└─────────────────────────────────────────┘
```

## File: `src/lib/conversionCopy.ts`

No structural changes needed. The `unlockHeadline`/`unlockSubline`/`unlockItems` fields stay for potential future use but won't be rendered in the drawer anymore.

## Summary of what gets removed
- Section 2 (unlock headline + chips) — ~120px saved
- Section 3 (why brands upgrade 2×2 grid) — ~140px saved  
- 3 Separator components — ~36px saved
- Positioning text per plan card — ~60px saved
- Product context row stays (only shows when thumbnail exists)

Total: ~350px reclaimed. Drawer fits in one screen.

