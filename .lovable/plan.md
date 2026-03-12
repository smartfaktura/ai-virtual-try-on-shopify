

## Mobile Hero Showcase — "Before → After Grid" Layout

### Problem
The current mobile layout still feels disjointed: a tiny product thumbnail + pills bar, then a horizontal scroll carousel. The product upload feels disconnected from the outputs, and horizontal scrolling hides most results.

### Idea: Integrated Grid Showcase
Replace the horizontal carousel on mobile with a **2-column grid** that shows the product upload as the first card (with a "Your Upload" badge) followed by 4 output cards — all visible at once without scrolling. Below that, scene switcher pills let users swap products. This is more impactful because:

- Users see 4 results immediately (no scrolling needed)
- The product photo sits naturally as the first grid item, creating a clear "1 → many" story
- Cleaner, more premium feel — like an Instagram grid

### Layout (mobile only, ~390px)

```text
┌──────────┬──────────┐
│ YOUR     │ Studio   │
│ UPLOAD   │ Lookbook │
│ (badge)  │          │
├──────────┼──────────┤
│ Golden   │ Café     │
│ Hour     │ Lifestyle│
├──────────┼──────────┤
│ Garden   │ Basketball│
│ Editorial│ Court    │
└──────────┴──────────┘
  [Crop Top] [Serum] [Ring]    ← scene pills
  "Same top ∞ environments"
```

### Changes — `src/components/landing/HeroSection.tsx`

#### Mobile section (lines 252-284) — Replace entirely
- Remove the compact product bar + separate carousel on mobile
- New mobile-only block (`flex md:hidden flex-col`):
  1. **2-column grid** (`grid grid-cols-2 gap-2`): First cell is the product upload with "Your Upload" overlay badge; next 5 cells are output images with scene labels
  2. **Scene switcher pills** centered below the grid
  3. **Caption** below pills

#### Desktop (lines 287-399) — No changes
Keep the existing side-by-side upload card + horizontal carousel layout.

#### Output carousel (lines 342-420)
- Add `hidden md:block` wrapper or conditionally render — the horizontal carousel only shows on desktop
- Mobile uses the grid instead

This gives an immediately visible, scroll-free showcase that feels polished on mobile while keeping the proven desktop layout intact.

