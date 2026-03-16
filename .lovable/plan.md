

## Plan: Replace placeholder gallery with Discover presets for new users

### Problem
New users with no generations see static placeholder images in the "What You Can Create" section. Instead, show real featured images from the Discover feed, with click-to-preview and a "View More" CTA linking to `/app/discover`.

### Changes

**`src/components/app/RecentCreationsGallery.tsx`**

When `creations.length === 0` (placeholder mode), instead of showing hardcoded `PLACEHOLDER_IMAGES`:

1. **Fetch featured discover presets** — query `discover_presets` where `is_featured = true`, ordered by `sort_order`, limit 10. Fall back to first 10 presets if no featured ones exist.

2. **Update the placeholder heading & copy**:
   - Title: "What You Can Create"
   - Subtitle: "AI-generated product photography. Copy any style, scene, or prompt to create your own."

3. **Make placeholder cards clickable** — clicking opens a lightweight preview (use `DiscoverDetailModal` or a simpler image lightbox showing the image + prompt + "Use This Style" CTA).

4. **Add "View More in Discover" button** — appears in the header area, links to `/app/discover`.

5. **Keep existing behavior intact** — when user has real creations, show "Recent Creations" as before.

### Implementation detail

- Import `useDiscoverPresets` hook in `RecentCreationsGallery`
- In placeholder mode, map discover presets to `displayItems` instead of `PLACEHOLDER_IMAGES`
- Add state for `selectedPreset` to show a simple modal/dialog with the image, title, prompt, and a button to navigate to Freestyle with the prompt pre-filled
- Add "View More" `<Button>` linking to `/app/discover` in the header when in placeholder mode
- Each card shows the preset's category as label and title as subtitle

