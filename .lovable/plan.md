## Problem

On `/`, the "Choose a model or create your own" section (component: `ModelsMarquee` rendered by `HomeModels`) sometimes shows fewer model images than expected on desktop, with visible gaps in the marquee.

## Root cause

`ModelCardItem` calls `setHidden(true)` and returns `null` whenever the image fails to load (slow network, transient Supabase render hiccup, optimized URL edge case). Because the marquee duplicates the items list (`[...items, ...items]`) and animates by exactly `-50%`:

- An image that fails in **only one** of the two duplicated copies removes that card on one side, breaking the seamless loop and leaving a gap that scrolls past the viewport.
- Multiple failures compound, producing the "missing models" effect on long desktop rows.
- Quality is also low (`quality=55`, no retina `srcSet`), which both looks soft and fails more often when Supabase render returns a transient error.

## Fix (single file: `src/components/landing/ModelShowcaseSection.tsx`)

### 1. Never unmount on error — render a stable placeholder instead

Replace the `if (hidden) return null` pattern with an `errored` flag that swaps the `<img>` for a neutral avatar placeholder (a `lucide` `User` icon on a `bg-muted/40` tile) while keeping the card's exact dimensions and the name label. This guarantees both copies of the doubled list always have identical width, so the `-50%` keyframe loop stays seamless and no gaps appear.

### 2. Bump image quality + add retina srcSet

Apply the same standard already used elsewhere on the homepage (per `mem://style/image-optimization-no-crop`):

- `getOptimizedUrl(url, { width: 360, height: 480, quality: 72, resize: 'cover' })` as the base `src`
- `getResizedSrcSet(url, { widths: [240, 360, 480], aspect: [3, 4], quality: 72 })` for `srcSet`
- `sizes="(max-width: 640px) 112px, (max-width: 1024px) 128px, 144px"` matching the actual tile widths (`w-28` / `sm:w-32` / `lg:w-36`)

`ShimmerImage` already extends `ImgHTMLAttributes`, so it forwards `srcSet`/`sizes` natively — no component changes needed.

### 3. Add `User` to the lucide import (alongside existing `Plus`)

## What does NOT change

- `MarqueeRow`, doubling logic, and CSS keyframes — already correct
- `BrandModelCTA` — untouched
- Interleave logic, sort/override hooks, eyebrow/title/subtitle props
- `HomeModels.tsx` — untouched

## Result

- Every model card always occupies its slot, even if the source image fails — marquee never gaps.
- Sharper portraits on retina displays at the same network cost (q72 with proper srcSet beats today's q55 single URL).
