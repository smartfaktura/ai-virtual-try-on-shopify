

## Improve Product Upload -- Design and Functionality

### Current Gaps
1. **No AI auto-fill**: The Generate wizard's `UploadSourceCard` already calls `analyze-product-image` to auto-detect title, type, and description -- but the Products page upload does NOT use this. Users have to fill everything manually.
2. **No drag-to-reorder images**: Users can only set a primary image by clicking the star. No way to reorder the gallery.
3. **Upload progress is invisible**: When submitting, the button just says "Uploading..." with no per-image feedback.
4. **Product type list is limited**: The dropdown has 26 types but no search/filter, making it hard to find the right one on mobile.

### Proposed Improvements

#### 1. AI Auto-Fill on First Image Upload (High Impact)
When the user uploads the first image, automatically call the existing `analyze-product-image` edge function to pre-fill:
- Product Name
- Product Type
- Description

Show a subtle "AI analyzing..." shimmer state on the form fields while analyzing. This reuses existing infrastructure -- no new edge functions needed.

**File: `src/components/app/ManualProductTab.tsx`**
- Import the `analyze-product-image` fetch logic (similar to `UploadSourceCard`)
- Trigger analysis when the first image is added via `addFiles`
- Auto-populate `title`, `productType`, and `description` states with AI results
- Show a shimmer/skeleton on the text fields during analysis
- Only auto-fill fields that are still empty (don't overwrite manual edits)

#### 2. Searchable Product Type Selector
Replace the basic `Select` dropdown with a `Command`-based combobox (already have `cmdk` installed) so users can type to filter product types.

**File: `src/components/app/ManualProductTab.tsx`**
- Replace the `Select` component with a `Popover` + `Command` combo
- Allow typing to filter the product type list
- Keep the same `PRODUCT_TYPES` array

#### 3. Upload Progress Indicator
Show individual image upload progress during submission instead of a single "Uploading..." button.

**File: `src/components/app/ManualProductTab.tsx`**
- Track upload progress as `currentImageIndex / totalImages`
- Show a thin progress bar above the action buttons during upload
- Update button text to "Uploading 2/4..." format

#### 4. Drag-to-Reorder Images (Nice to Have)
Allow users to drag images in the gallery to reorder them. The first position automatically becomes the cover image.

**File: `src/components/app/ProductImageGallery.tsx`**
- Add pointer-based drag reorder using native HTML drag events (no new library)
- When an image is dragged to position 0, it becomes the primary/cover
- Visual feedback: ghost preview while dragging, drop indicator between slots

### Implementation Order
1. AI Auto-Fill (biggest UX win, reuses existing edge function)
2. Searchable Product Type
3. Upload Progress
4. Drag-to-Reorder (if time allows)

### Files Modified
- `src/components/app/ManualProductTab.tsx` -- AI auto-fill, searchable type, progress
- `src/components/app/ProductImageGallery.tsx` -- drag reorder

### No Backend Changes
All improvements are frontend-only. The `analyze-product-image` edge function already exists and works.
