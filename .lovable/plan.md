

## Goal
Polish the empty Products page and the Add Products form so they don't expose controls/fields that have no purpose yet. Apple-style: show only what's actionable at this moment.

## Locating the code
- Products list page: likely `src/pages/Products.tsx` (route `/app/products`)
- Add page: `src/pages/AddProduct.tsx` or similar (route `/app/products/new`)
- The hero empty-state CTA already lives in `EmptyStateCard` — pattern is established.

I'll confirm exact filenames during implementation.

## Changes

### 1. Products page — empty state
When `products.length === 0` AND no search active:
- **Hide**: search bar, type filter, sort dropdown, grid/list view toggle
- **Show only**: page title + subtitle + the existing centered empty state (icon, "Upload your first product…", Add Products button)
- Once at least 1 product exists → all controls return

If user is searching/filtering and gets 0 results → keep controls visible, show "No products match" instead (different empty state).

### 2. Add Products page — progressive disclosure
Current: upload zone + Name/Type/Description/Dimensions/More details all visible at once. Overwhelming and implies typing is required.

New flow:
- **Initial state**: Sienna tip + source tabs (Upload / URL / CSV / Mobile / Shopify) + the drop zone. Nothing else.
- **After image(s) added**: form fields fade in below (Name, Type, chips, Description, Dimensions, More details). AI auto-fill populates Name/Type from analysis as it always has — user just confirms.
- **Bottom action bar** (Cancel / Add Product) only appears once an image is present.
- For multi-image batch (Each image creates a separate product): skip per-product fields entirely, show "X products will be created — details auto-detected" summary instead.

### 3. Extra polish tips I'll apply
- **Sienna tip**: Make dismissible state persist in `localStorage` (currently re-appears every visit — annoying once learned).
- **Source tabs**: Underline-style tabs instead of pill buttons — quieter, more Apple.
- **Drop zone**: Reduce border weight from `dashed-2` to `dashed-1` and increase internal padding for more breathing room. Hover state: subtle bg tint, no border color shift.
- **"browse" link**: Make it a real `<button>` with focus ring, not just bold text.
- **Form section header**: Once image uploaded, show small "Product details" label above the fields with a hairline separator — gives the form a clear identity instead of floating inputs.
- **Category chips**: Currently always visible under Type input. Move them inline as a quieter "Suggested:" row only when Type field is empty AND focused.
- **Mobile**: Stack Name/Type and Description/Dimensions vertically (already responsive but verify gap is generous).

## Files to edit
- `src/pages/Products.tsx` — conditional rendering of toolbar
- `src/pages/AddProduct.tsx` (or wherever the add form lives) — progressive disclosure, dismissible tip persistence, tab restyle, drop zone polish

No backend / data changes. No new deps.

## Acceptance
- Empty Products page: only title + centered empty state CTA, no toolbar
- Add page initial: only tip + tabs + drop zone — no form fields
- After uploading 1 image: form fields appear with auto-filled name/type, Add Product button enabled
- After uploading 2+ images: batch summary shown, no per-product fields
- Sienna tip stays dismissed across visits
- All transitions are gentle fade/slide, not jumpy

