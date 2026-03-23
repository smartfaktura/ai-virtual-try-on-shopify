

# Add "Copy to Editor" Button in Freestyle Detail Modal

## Current State
- **Delete** button exists but is buried below Generate Video
- **Copy to Editor** button (that restores prompt + model + scene + product to the freestyle editor) only exists on the gallery thumbnail cards, not in the detail modal

## Plan

### `src/components/app/LibraryDetailModal.tsx`

1. **Add a "Copy to Editor" button** for freestyle items, placed right after the Download button (top of actions). This reuses the same `onCopySettings` pattern from FreestyleGallery.

2. **Add `onCopySettings` prop** to `LibraryDetailModalProps`:
   ```ts
   onCopySettings?: (settings: { prompt: string; modelId?: string | null; sceneId?: string | null; productId?: string | null; aspectRatio?: string }) => void;
   ```

3. **Add the button** after Download, before Enhance — only when `item.source === 'freestyle'`:
   ```tsx
   <Button variant="outline" onClick={() => { onCopySettings?.({...}); onClose(); }}>
     <Copy /> Copy to Editor
   </Button>
   ```

4. **Move Delete** into a subtle row at the very bottom of all actions (after Generate Video), keeping it as a small ghost button — same as now but separated with a thin divider.

### `src/pages/Freestyle.tsx`

5. **Pass `onCopySettings`** to `LibraryDetailModal` using the existing `handleCopySettings` handler already built for the gallery.

### Layout order (freestyle items):
1. Download Image (primary)
2. **Copy to Editor** (new, outline)
3. Enhance to 2K / 4K
4. Generate Perspectives
5. Generate Video (coming soon)
6. ── thin separator ──
7. Delete (ghost, destructive)

Two files, ~15 lines added.

