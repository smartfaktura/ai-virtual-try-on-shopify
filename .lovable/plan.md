

## Improve Upload Step UX for Interior/Exterior Staging

**Problem**: The upload step shows "Your Recent Uploads" (a grid of previous images, often irrelevant clothing photos) first, pushing the actual upload area to the bottom. For interior/exterior staging, the primary action should be uploading a new room photo.

### Changes in `src/pages/Generate.tsx` (lines 1680-1713)

**Reorder the upload step layout:**

1. **Move `UploadSourceCard` (the drag-and-drop upload area) ABOVE the recent uploads gallery** — swap lines 1709-1713 to come before lines 1681-1707

2. **Make recent uploads a collapsible section** — wrap the previous uploads in a `Collapsible` component (already available via `@radix-ui/react-collapsible`) with a subtle trigger like "Or reuse a previous photo (X available)" so it doesn't dominate the view

3. **Reduce the recent uploads grid** — change from `grid-cols-4 sm:grid-cols-5 md:grid-cols-6` to `grid-cols-3 sm:grid-cols-4 md:grid-cols-5` with a max of 8 shown (add "Show more" if needed), so it stays compact

**Resulting layout order:**
1. Title + subtitle ("Upload Your Photo")
2. Upload tips (interior/exterior contextual tips)
3. **Upload area (drag & drop)** — primary action, immediately visible
4. **Collapsible "Or reuse a previous photo"** — secondary action, collapsed by default

This ensures users see the upload action first and recent photos are accessible but not overwhelming.

