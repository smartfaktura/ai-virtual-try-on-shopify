## Goal
Remove the "Share to Explore" overlay button from generated images in `/app/freestyle`, while keeping the codepath intact for future re-enabling.

## Change

### File: `src/components/app/freestyle/FreestyleGallery.tsx`

The `ImageCard` component conditionally renders a Share to Explore button (Send icon, lines ~425-433) only when the `onShareToDiscover` callback prop is provided.

**Action:** Stop passing `onShareToDiscover` to `ImageCard` instances within the gallery grid. This is a single prop removal — the conditional `{onShareToDiscover && (...)}` block in `ImageCard` will then never render for freestyle images.

**Preserve:**
- `SubmitToDiscoverModal` import and component (still used elsewhere)
- `shareImg` state and `shareHandler` logic (kept in place but unused)
- All other image action buttons: Download, Delete, Copy Settings, Add as Scene, Add as Model, Add to Discover

## Scope
Presentational only. No logic, state, or modal changes. Other routes (e.g., product-images) that pass `onShareToDiscover` to their own gallery instances are unaffected.
