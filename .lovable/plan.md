# Plan: Material Swap card animation for /app/workflows

## What I’ll build
- Add a dedicated animated thumbnail for the **Material Swap** card on `/app/workflows`
- Use your **5 uploaded chair images** as a lightweight looping **image sequence** so it matches the existing workflow cards
- Keep it **optimized for fast loading** and **safe on mobile** by reusing the current thumbnail system instead of introducing a new video player

## Approach
1. **Externalize the 5 uploaded images as app assets**
   - Convert each uploaded chair image into a CDN-backed asset pointer
   - This keeps the repo light and serves the images efficiently

2. **Register a new Material Swap scene in the existing animation data**
   - Add a `workflowScenes['Material Swap']` entry in `src/components/app/workflowAnimationData.tsx`
   - Use `mode: 'carousel'` with all 5 chair variations as `backgrounds`
   - Add 2 short overlay badges so the card feels consistent with Product Swap / Generate More Angles
   - Keep timing subtle and premium, likely around 1200–1800ms per frame

3. **Plug it into the existing card system**
   - No new card component
   - `WorkflowCardCompact` already reads from `workflowScenes[workflow.name]`, so once the Material Swap scene exists, the card will animate automatically

4. **Optimize for speed and stability**
   - Keep using the existing `getOptimizedUrl(..., { quality: 60 })` pattern for carousel backgrounds
   - Do not use width transforms for these full-card images, since this project already avoids width-based crop zoom on card imagery
   - Rely on the current intersection-based activation so offscreen cards don’t animate unnecessarily

5. **Validate visually**
   - Confirm the Material Swap card animates in `/app/workflows`
   - Check desktop and mobile layout/feel
   - Make sure transitions read clearly and don’t feel too fast or too busy

## Why this is the safe path
- It matches the architecture already used by the other animated workflow cards
- It avoids heavier MP4/WebM logic, autoplay quirks, poster handling, and extra mobile/browser risk
- It limits scope to the workflow card preview only, exactly as requested

## Risks and mitigations
- **Risk: animation feels jumpy** because the chair changes color abruptly between frames  
  **Mitigation:** use a slightly slower interval and let the existing progress/overlay system smooth the perception

- **Risk: loading weight increases** with 5 full images  
  **Mitigation:** CDN assets + existing optimized image URLs + reuse only on this one card

- **Risk: mobile card feels visually noisy**  
  **Mitigation:** keep overlays minimal and reuse the existing compact/mobile behavior already built into `WorkflowAnimatedThumbnail`

## Files I expect to touch
- `src/components/app/workflowAnimationData.tsx`
- New asset pointer files under `src/assets/` for the 5 uploaded chair images

## Out of scope
- No changes to `/app/material-swap` page behavior
- No backend/database changes
- No true video generation or MP4 asset
- No redesign of the workflows grid

## Expected result
The **Material Swap** card on `/app/workflows` will show a polished looping preview of the chair changing materials/colors, using your uploaded images, with fast-loading optimized assets and behavior consistent with the other workflow cards.