

# Improve Product Upload Layout: Visible Reference Angles + URL Import Roles

## What's Wrong Now
1. Reference angle uploads (Back/Side/Packaging) are hidden inside a collapsed accordion — users can't see them
2. When importing from URL, users can only pick a "primary" image — no way to assign back/side/packaging roles to other imported images
3. The layout feels cramped, especially in edit mode

## Changes

### 1. ManualProductTab — Show reference slots inline next to main image
Replace the collapsed "Reference angles" Collapsible with a visible layout where the main image sits on the left (larger) and 3 small placeholder slots (Back, Side, Packaging) sit to its right in a vertical stack. Each slot shows a dashed placeholder with a label when empty, and a thumbnail with remove button when filled. This makes them immediately visible without clicking anything.

Layout (single product mode, after image is uploaded):
```text
┌──────────────────┐  ┌──────────┐
│                  │  │ Back     │
│   Main Image     │  │  + add   │
│   (hero)         │  ├──────────┤
│                  │  │ Side     │
│                  │  │  + add   │
│                  │  ├──────────┤
│                  │  │ Packaging│
│                  │  │  + add   │
└──────────────────┘  └──────────┘
```
- Main image: ~200px tall, takes ~65% width
- Reference slots: 3 stacked, ~56×56px each, right side
- Small helper text below: "Extra angles auto-fill during generation"
- Remove the old Collapsible for reference angles entirely

### 2. ManualProductTab — Empty state (no image yet)
Keep the existing dropzone but add a subtle note: "You can add back, side & packaging views after uploading"

### 3. StoreImportTab — Add role assignment for imported images
After URL import, when showing the image thumbnails grid, add role badges. Currently users click to set "primary". Enhance:
- First click = set as Primary (existing behavior, blue border + check)
- Add small dropdown/badge buttons below the thumbnails row: "Back", "Side", "Packaging"
- User can long-press or right-click a thumbnail to assign a role, or simpler: add a row of 3 small labeled slots below the primary selector (same pattern as ManualProductTab) where users can drag/click from the extracted images
- On save, pass `back_image_url`, `side_image_url`, `packaging_image_url` to the insert

Implementation: Add state for `backImageIndex`, `sideImageIndex`, `packagingImageIndex`. Show clickable role labels under each thumbnail. Save these URLs alongside the product.

### 4. Layout polish for edit mode
- Tighten spacing, ensure the image + reference angles layout works well on both `/app/products/new` and `/app/products/:id` edit pages
- "More details" accordion stays collapsed (it's fine as-is for power users)

## Files to Change

1. **`src/components/app/ManualProductTab.tsx`** — Replace collapsible reference angles with inline visible slots next to main image; adjust layout
2. **`src/components/app/StoreImportTab.tsx`** — Add role assignment (back/side/packaging) to imported image thumbnails; save extra URLs on product insert
3. **`src/pages/AddProduct.tsx`** — Minor layout spacing tweaks if needed

## Scope
- ~150 lines changed in ManualProductTab (layout restructure)
- ~80 lines changed in StoreImportTab (role assignment + save logic)
- No database changes needed (columns already exist)

