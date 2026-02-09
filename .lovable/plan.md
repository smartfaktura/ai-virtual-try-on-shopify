

## Polish: Virtual Try-On Product Step

Redesign the product/source step for the Virtual Try-On workflow to connect real user products from the database and add educational guidance for "From Scratch" uploads (inspired by the Botika reference screenshots).

---

### 1. Connect Real User Products from Database

**Problem**: The product selection step currently uses `mockProducts` (hardcoded demo data). Users who have added real products to their account (stored in `user_products` table) never see them in the workflow.

**Fix**: When the Virtual Try-On workflow is active, fetch `user_products` from the database and display them in the product grid alongside (or instead of) mock products. Reuse the same query pattern already used in Freestyle (`src/pages/Freestyle.tsx`) and Products pages.

**Changes in `src/pages/Generate.tsx`**:
- Add a `useQuery` call to fetch `user_products` for the current user (same pattern as Freestyle page line 54-58)
- In the product selection step, show real DB products as selectable cards (with thumbnail, title, product type)
- When a DB product is selected, map it to the existing `Product` type so the rest of the flow works unchanged
- Keep "From Scratch" upload as an alternative option
- Show an empty state with a link to `/app/products` if no products exist

---

### 2. Redesign Source Step for Try-On Context

**Problem**: The current source step is generic ("How do you want to start?") and doesn't guide users about what makes a good try-on image.

**Fix**: When `activeWorkflow?.uses_tryon`, replace the generic source step with a try-on-specific layout:
- Two clear options: "Select from My Products" and "Upload New Image"
- Each option has a clothing-specific icon and description
- The description for "Upload" specifically mentions: garment photos, mannequin shots, or flat lays of clothing

**Changes in `src/pages/Generate.tsx`**:
- Conditionally render a try-on-specific source step when `activeWorkflow?.uses_tryon`

---

### 3. Add Educational Image Guide for "From Scratch" Upload

**Problem**: When users choose "From Scratch" for try-on, there's no guidance about what kinds of images work well and what to avoid. The Botika reference shows a two-panel guide with example images.

**Fix**: Create a new component `TryOnUploadGuide` that appears above or alongside the upload area when in try-on mode. It shows two animated/toggling sections:

**"What Works Best" section** (green checkmarks):
- Clear front-facing garment on model or mannequin
- Single garment, well-lit, wrinkle-free
- Headless/cropped model shots showing the full garment
- Simple, clean background

**"What to Avoid" section** (red X marks):
- Covered/cropped garments, selfie-style photos
- Flat lay images (garment laid flat, not on body/mannequin)
- Group photos with multiple people
- Accessories covering the garment, bad lighting

**Implementation**:
- New component: `src/components/app/TryOnUploadGuide.tsx`
- Uses a simple toggle or auto-cycling animation between "What Works Best" and "What to Avoid"
- Each panel shows 3 illustrative thumbnails with green check or red X badges (matching the Botika reference UI)
- Uses existing product assets from `src/assets/products/` for the example thumbnails (e.g., `tank-white-1.jpg` as a good example, `faux-fur-jacket-1.jpg` styled differently)
- The guide text is concise, not overwhelming

---

### 4. Enhance Upload Step for Try-On Context

**Problem**: The upload step title says "Upload Your Image" generically. For try-on, it should be clothing-specific.

**Fix**: When in try-on workflow:
- Title: "Upload Your Garment Photo"
- Subtitle: "Upload a clear photo of the clothing item you want to try on"
- Show the `TryOnUploadGuide` component between the title and the upload area
- The upload area's placeholder text changes to "Drag & drop your garment photo"
- Product type dropdown auto-filters to clothing-only types

**Changes in `src/pages/Generate.tsx`** (upload step section):
- Conditionally use try-on-specific copy
- Render `TryOnUploadGuide` above `UploadSourceCard`

---

### 5. Skip "Mode" Step for Try-On Workflows

**Problem**: After product selection, try-on workflows still route to a "Mode" step asking users to choose between "product-only" and "virtual-try-on" -- redundant since the workflow is always try-on.

**Fix**: When `activeWorkflow?.uses_tryon`, skip the mode step entirely in product selection handlers:
- In the product selection `onClick` (line 617-639): route to `'brand-profile'` or `'model'` instead of `'mode'`
- In the upload step completion (line 584-598): same fix
- The mode is already set to `'virtual-try-on'` via `useEffect`

**Changes in `src/pages/Generate.tsx`**:
- Product selection handler: check `activeWorkflow?.uses_tryon` before `isClothingProduct` check
- Upload completion handler: check `activeWorkflow?.uses_tryon` before clothing check

---

### Summary of File Changes

| File | Action | Description |
|---|---|---|
| `src/components/app/TryOnUploadGuide.tsx` | **New** | Educational guide component with "What Works Best" / "What to Avoid" panels, example thumbnails with check/X badges, auto-cycling animation |
| `src/pages/Generate.tsx` | **Edit** | Add `user_products` query; show DB products in product step for try-on; try-on-specific source step copy; render TryOnUploadGuide in upload step; skip mode step for try-on workflows; try-on-specific upload copy |

### Notes
- The `TryOnUploadGuide` component will use existing product assets from `src/assets/products/` as illustrative examples (no new images needed)
- DB products are mapped to the existing `Product` type interface so all downstream logic (generation, preview, etc.) works without changes
- The guide auto-cycles between the two panels every 4 seconds with a smooth crossfade, or users can click to toggle manually

