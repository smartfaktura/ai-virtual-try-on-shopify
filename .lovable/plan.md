## Upgrade Product Images results page modal to match Library detail

Currently the results page in `/app/generate/product-images` opens images in a basic `ImageLightbox` (image + arrows + 3 inline action icons). Replace it with a full split-screen detail modal modeled on `LibraryDetailModal`, trimmed to only the actions you asked for.

### New component: `ResultDetailModal`
File: `src/components/app/product-images/ResultDetailModal.tsx`

Layout mirrors `LibraryDetailModal`:
- Portal-mounted full-screen overlay, 60/40 split (image left, info right) on desktop, stacked on mobile
- Close on backdrop click / Escape, body scroll lock
- Multi-image navigation (prev/next arrows, ←/→ keys)
- Image rendered with correct aspectRatio via `ShimmerImage`

Right panel — **only**:
- Small label: `PRODUCT VISUALS`
- Heading: `{productName}` + small `· {sceneName}` subline
- Action buttons (stacked, same styling as Library modal):
  1. **Download Image** (primary) → `saveOrShareImage`
  2. **Edit Image** → navigate to `/app/freestyle?editImage=…&imageRole=edit`
  3. **Enhance to 2K / 4K** → opens `UpscaleModal` with `{ imageUrl, sourceType: 'generation', sourceId: jobId }`
  4. **Generate More Angles** → navigate to `/app/perspectives?source=…`
  5. **Generate Video** → navigate to `/app/video/animate?imageUrl=…`

**Explicitly excluded** (per request):
- No date
- No Delete button
- No "Share to Explore" card
- No "Tag Us · Win a Free Year" card
- No admin actions

### Wiring changes

1. **`src/pages/ProductImages.tsx`** — `finishWithResults` (L1124): include `jobId: job.id` on every image object so the modal can pass it to `UpscaleModal`.
2. **`src/pages/ProductImages.tsx`** — extend the `results` state type and `ProductImagesStep6Results` `results` prop type to include `jobId?: string` per image.
3. **`src/components/app/product-images/ProductImagesStep6Results.tsx`**:
   - Replace the `ImageLightbox` usage with the new `ResultDetailModal`
   - Pass an array of `{ url, productName, sceneName, aspectRatio, jobId }` items + `initialIndex`
   - Keep the existing per-image download button + grid behavior

### Notes
- Keep `ContextualFeedbackCard` on the page itself (already there); no feedback survey inside the new modal — keeps it focused, matches your "no extra cards" intent.
- Reuse styling tokens; no new colors. Follows project rules (rounded-xl, semantic tokens).

### Verification
- Open a result image → split modal appears with image left, 5 action buttons right, no date/delete/share/tag cards.
- Arrow keys + nav buttons cycle through the product group.
- Download saves the image; Edit/Angles/Video navigate correctly; Enhance opens UpscaleModal preselected with the result.