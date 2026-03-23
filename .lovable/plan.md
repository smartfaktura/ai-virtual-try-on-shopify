

# Virtual Try-On Carousel, Progress Bar, Bigger Card Text & Mobile UX

## Summary
1. Upload 6 Virtual Try-On images to storage and convert its animation to carousel mode (like Product Listing)
2. Add a progress bar (loading line) on top of each carousel card — same as "All products look better here" `CategoryCard`
3. Increase card text sizes and CTA button sizes in the modal
4. Improve mobile layout to show cards bigger (2-col stacked or single scroll)

## Changes

### 1. Upload images & update `workflowAnimationData.tsx`

Upload the 6 uploaded Virtual Try-On images (`Vovvai-1.jpg` through `Vovvai-6.jpg`) to `landing-assets/workflows/virtual-tryon-showcase/`.

Update `'Virtual Try-On Set'` scene to use `mode: 'carousel'` with a `backgrounds` array of these 6 images. Remove the old floating element overlays (product chip, model circle, scene chip, plus action) since carousel mode uses clean image cycling.

### 2. Add progress bar to `CarouselThumbnail` in `WorkflowAnimatedThumbnail.tsx`

Borrow the progress bar pattern from `ProductCategoryShowcase.tsx`:
- A 3px bar at the top of the thumbnail: `h-[3px] bg-muted/40` with a fill div animated via `progress-fill` keyframes
- Reset the progress bar key each time the carousel advances (using a `progressKey` state that increments with each image change)
- Duration matches the carousel `INTERVAL` (currently 1000ms — may increase to ~2500ms for better visual effect)

### 3. Bigger text & CTA in `WorkflowCardCompact.tsx` for `modalCompact`

Current modal sizes are too small (`text-[11px]` title, `text-[10px]` subtitle/CTA, `h-6` button). Update to:
- Title: `text-sm font-bold` (was `text-[11px]`)
- Subtitle: `text-xs` (was `text-[10px]`)
- CTA button: `h-8 px-4 text-xs` (was `h-6 px-2 text-[10px]`)
- Card padding: `p-3` (was `p-2`)

### 4. Mobile modal layout in `StartWorkflowModal.tsx`

On mobile the 3-col grid makes cards too small. Change to:
- Mobile: `grid-cols-1` with horizontal scroll or a vertical stack showing each card at a comfortable width
- Better approach: Use `grid-cols-3` still but with reduced aspect ratio `aspect-[4/5]` and the larger text sizes from step 3. Or switch to `grid-cols-2` on mobile with a scrollable layout.
- Simplest fix: keep 3-col but remove `modalCompact` sizing constraints on mobile — use regular `text-xs`/`text-sm` sizes. Actually, switch mobile to a horizontal scroll with `flex overflow-x-auto snap-x` and cards at `w-[70vw]` each.

Final approach for mobile: Use a horizontal snap-scroll with cards at `min-w-[200px]` so each card is large enough to read. Desktop keeps the 3-col grid.

### Files
- `src/components/app/workflowAnimationData.tsx` — Virtual Try-On carousel + new image URLs
- `src/components/app/WorkflowAnimatedThumbnail.tsx` — add progress bar to `CarouselThumbnail`
- `src/components/app/WorkflowCardCompact.tsx` — bigger text, subtitle, CTA sizes
- `src/components/app/StartWorkflowModal.tsx` — mobile horizontal scroll layout

