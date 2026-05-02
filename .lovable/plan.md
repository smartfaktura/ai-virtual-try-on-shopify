
## Changes

### 1. Replace `pvImages` with 8 new curated batches (`src/components/app/workflowAnimationData.tsx`)

Replace the existing `pvRaw` array with the 24 new images (8 batches × 3). The collage rotates through batches of 3, so each batch forms one "slide". Use `getOptimizedUrl` with `quality: 60` as before. Use the `/object/public/` URLs (not `/render/`).

### 2. Fix mobile RECOMMENDED badge (`src/components/app/WorkflowHeroCard.tsx`)

- Remove the absolute-positioned badge that overlaps images
- On mobile: place full "RECOMMENDED" pill below the collage, above the title (inside the content section)
- On desktop: keep absolute positioned badge on the card as-is

### 3. Override description to say 1600+ (`src/components/app/WorkflowHeroCard.tsx`)

The `workflow.description` comes from the DB and says "1000+". Override it in the component: if description contains "1000+", replace with "1600+".

### 4. Update other 1000+ references

Update references in `HomeTransformStrip.tsx`, `HomeHowItWorks.tsx`, `HomeFAQ.tsx`, `learnContent.ts`, `ProductVisualsGuide.tsx`, and `mockData.ts` from 1000+ to 1600+.

### Files changed
- `src/components/app/workflowAnimationData.tsx`
- `src/components/app/WorkflowHeroCard.tsx`
- `src/components/home/HomeTransformStrip.tsx`
- `src/components/home/HomeHowItWorks.tsx`
- `src/components/home/HomeFAQ.tsx`
- `src/data/learnContent.ts`
- `src/components/app/learn/ProductVisualsGuide.tsx`
- `src/data/mockData.ts`
