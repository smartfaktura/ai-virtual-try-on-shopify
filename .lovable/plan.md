

## Lazy-Load Hero Showcase Images — Only Fetch on Demand

### Current Behavior
- **Line 152-163**: On mount, ALL 24 output images across all 3 showcases are preloaded (scene 0 immediately, scenes 1-2 after 3s)
- This means ~16 extra images are fetched that the user may never see (if they never click Face Serum or Gold Ring)
- When switching scenes, `ShimmerImage` remounts → shows shimmer again even if the image is cached, causing a visual flash

### Proposed Changes in `src/components/landing/HeroSection.tsx`

**1. Only preload active scene (White Crop Top) on mount — defer others to on-click:**
- Remove the 3s timeout that preloads scenes 1-2
- Instead, preload a scene's images when its pill is clicked (just before `setActiveScene`)
- This cuts initial network requests from ~24 images to ~8

**2. Cache already-visited scenes so images don't re-shimmer:**
- Track which scenes have been visited in a `Set` ref
- When a scene has been previously loaded, skip the shimmer placeholder by passing a prop or using a key that doesn't reset

**3. Preload only the product thumbnail for inactive scenes (tiny image) so the left card transitions instantly on click:**
- On mount, prefetch just the 2 product thumbnails (~2 small images) instead of all 16 output images

### Result
- Initial load: 8 output images + 1 product image (White Crop Top) + 2 small product thumbnails
- On click Face Serum: 8 output images fetched on demand
- On click Gold Ring: 8 output images fetched on demand  
- Revisiting a scene: images served from browser cache, no shimmer flash

Single file change.

