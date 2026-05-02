
## Changes

### 1. Fix RECOMMENDED badge on mobile (`src/components/app/WorkflowHeroCard.tsx`)

The badge at `absolute top-3 right-3` overlaps the collage images on mobile. Move it inside the collage area or reposition it so it doesn't clip. Options:
- Reduce badge size on mobile: smaller text, less padding
- Position it inside the image grid (bottom-right of the third image) on mobile
- Or hide badge text on mobile, show only the sparkle icon

Proposed fix: make the badge smaller on mobile with `text-[9px] sm:text-[10px]` and tighter padding, and shift it slightly: `top-2 right-2 sm:top-3 sm:right-3`.

### 2. Update scene count (`src/components/app/WorkflowHeroCard.tsx`)

Change the tag pill from `'1000+ Scenes'` to `'1600+ Scenes'` (line 91).

### Files changed
- `src/components/app/WorkflowHeroCard.tsx`
