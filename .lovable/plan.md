

## Add "Add to Discover" Admin Button

### What It Does
Adds a new admin-only button in the Freestyle gallery (and Library detail modal) that directly publishes an image to the Discover feed -- no submission/review needed. This is separate from the existing "Share to Discover" (which submits for review).

### Changes

**1. New Component: `src/components/app/AddToDiscoverModal.tsx`**
- Similar form to `SubmitToDiscoverModal` but for admins
- Title: "Add to Discover" instead of "Share to Discover"
- Fields: title, category, tags, aspect ratio, quality (pre-filled from image metadata)
- On submit: inserts directly into `discover_presets` table (same as the approve flow in `useApproveSubmission`)
- Button label: "Publish to Discover" (no review step)

**2. `src/components/app/freestyle/FreestyleGallery.tsx`**
- Import `AddToDiscoverModal`
- Add state for `addToDiscoverImg`
- For admin users, add a new button (e.g., globe/compass icon) in the image card action bar, next to "Add as Scene" and "Add as Model"
- Wire the modal open/close

**3. `src/components/app/LibraryDetailModal.tsx`**
- In the "Admin Actions" section (line 186-206), add a third button: "Add to Discover"
- Import and wire `AddToDiscoverModal`

### Flow
- Admin hovers over a freestyle image -> sees new globe icon button
- Clicks it -> modal opens with title/category/tags form
- Fills in details -> clicks "Publish to Discover"
- Image is inserted directly into `discover_presets` and appears immediately in the Discover feed

### Technical Notes
- The insert goes to the `discover_presets` table with fields: `title`, `prompt`, `image_url`, `category`, `tags`, `aspect_ratio`, `quality`, `sort_order: 0`, `is_featured: false`
- Only visible to admin users (uses existing `useIsAdmin` hook)
- The existing "Share to Discover" (Send icon) remains available for all users as the submission flow

