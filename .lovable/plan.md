

## Replace Freestyle Lightbox with Library-Style Detail Modal

Currently, freestyle uses the simple `ImageLightbox` component (just image + Download/Delete/Copy Prompt/Share buttons). The library uses `LibraryDetailModal` — a split-panel layout with image on the left, and a full info panel on the right including **Upscale**, **Perspectives**, **Share to Discover**, prompt display, and admin actions.

### Approach

Replace the `ImageLightbox` usage in `src/pages/Freestyle.tsx` with `LibraryDetailModal`, converting the freestyle image data into the `LibraryItem` format it expects. This is straightforward since `FreestyleImage` already has all the fields needed (`id`, `url`, `prompt`, `aspectRatio`, `quality`, `createdAt`).

### Changes

**`src/pages/Freestyle.tsx`** (~15 lines changed):
1. Replace `ImageLightbox` import with `LibraryDetailModal` import
2. Convert the selected `savedImages[lightboxIndex]` into a `LibraryItem` object:
   ```typescript
   const lightboxItem: LibraryItem = {
     id: img.id,
     imageUrl: img.url,
     source: 'freestyle',
     label: 'Freestyle',
     prompt: img.prompt,
     date: new Date(img.createdAt).toLocaleDateString(),
     createdAt: new Date(img.createdAt).toISOString(),
     aspectRatio: img.aspectRatio,
     quality: img.quality,
   };
   ```
3. Replace the `<ImageLightbox>` block with `<LibraryDetailModal item={lightboxItem} open={lightboxOpen} onClose={...} />`
4. Remove the now-unnecessary `onNavigate`, `onDownload`, `onDelete`, `onCopyPrompt` handlers from the lightbox (they're built into LibraryDetailModal)
5. Keep the `SubmitToDiscoverModal` for the share flow (LibraryDetailModal has its own share button built in, so the external share trigger can be removed)

**One file, simple swap.** The freestyle lightbox will immediately gain Upscale, Perspectives, Share to Discover, and the polished split-panel layout — identical to library.

