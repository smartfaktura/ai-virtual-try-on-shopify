

## Replace Raw `<img>` Tags with `ShimmerImage` Across Landing Page

### Problem
Three landing page sections still use raw `<img>` tags with no shimmer/loading state, causing images to pop in abruptly — especially noticeable on the "How It Works" Step 3 grid (the screenshot you shared) and the 12-card Channel Showcase grid.

### Sections to Fix

**1. `src/components/landing/HowItWorks.tsx`** — 7 raw `<img>` tags
- `HoverPreview` component: 2 img tags (thumbnail + hover preview) — replace both with `ShimmerImage`
- Step 1 drag-drop product thumbnail (line 169)
- Step 3 header product thumbnail (line 310)
- Step 3 grid: 6 scene images in the 3×2 grid (lines 327-331) — these are the ones in your screenshot

**2. `src/components/landing/ChannelShowcase.tsx`** — 13 raw `<img>` tags
- Source product callout (line 49)
- 12-card grid (line 65-70) — all use raw `<img>` with no loading placeholder

**3. `src/components/landing/FinalCTA.tsx`** — team avatar `<img>` tags (line 58-63)
- Small 40×40 circular avatars; replace with `ShimmerImage` for consistency

### Approach
- Import `ShimmerImage` in each file
- Replace `<img>` with `<ShimmerImage>`, preserving existing `className`, `loading`, and `alt` props
- Add `loading="lazy"` and `decoding="async"` where not already present (all below-fold)
- For the ChannelShowcase grid and HowItWorks Step 3 grid, add `aspectRatio` props to reserve space and prevent layout shift

### No structural or layout changes — purely swapping the image component for consistent shimmer loading states across the entire homepage.

