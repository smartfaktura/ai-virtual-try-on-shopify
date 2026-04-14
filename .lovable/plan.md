

# Improve Product References in Short Film — Multi-Angle & Multi-Product

## Current State
- Product picker fetches only `id, title, image_url` — ignores `back_image_url`, `side_image_url`, `packaging_image_url`, `inside_image_url`, `texture_image_url`, `extra_image_urls`
- Picking a product adds a single `ReferenceAsset` with the main image only
- No concept of "Product 1", "Product 2" grouping — all product refs are flat
- The `ReferenceAsset` type has no `subRole` or `productId` field to distinguish angles

## Plan

### 1. Extend ReferenceAsset type
**File: `src/components/app/video/short-film/ReferenceUploadPanel.tsx`**

Add optional fields to `ReferenceAsset`:
- `subRole?: 'main' | 'back' | 'side' | 'packaging' | 'inside' | 'texture' | 'extra'` — which angle this image represents
- `productId?: string` — links reference back to its source user_product

### 2. Fetch full product data in picker
**File: `src/components/app/video/short-film/ReferenceUploadPanel.tsx`**

Update the product query to also select `back_image_url, side_image_url, packaging_image_url, inside_image_url, texture_image_url, extra_image_urls`.

### 3. Redesign `pickProduct` to add all available angles
When a user picks a product from the library, auto-create one `ReferenceAsset` per available angle:
- Main image → `subRole: 'main'`
- Back → `subRole: 'back'` (if exists)
- Side → `subRole: 'side'` (if exists)
- etc.

All share the same `productId` for grouping.

### 4. Redesign the Product References section UI
Replace the flat thumbnail list with a **per-product card** layout:

```text
┌─────────────────────────────────────┐
│ Product 1: Beige Full-Zip Hoodie    │
│ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │ Main │ │ Back │ │ Side │  + more  │
│ │  ✓   │ │  ✓   │ │  —   │         │
│ └──────┘ └──────┘ └──────┘         │
│ [Upload missing angles]             │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Product 2: Black Leather Bag        │
│ ...                                 │
└─────────────────────────────────────┘
```

- Each product card shows its name and a row of angle slots (main, back, side, packaging, inside, texture)
- Filled slots show the image with a green check; empty slots show a dashed upload target
- Users can upload directly to a specific angle slot
- A remove button removes the entire product group

For non-product-library uploads (drag & drop), keep the current flat behavior but label them as "Custom Upload".

### 5. Update the generation hook to use multi-angle refs
**File: `src/hooks/useShortFilmProject.ts`**

In `getSourceImageForShot`, when matching a product reference, prefer the most relevant angle based on shot role:
- `detail_closeup` / `product_focus` → prefer `texture` or `side`
- `product_reveal` → prefer `main`
- `hook` / `highlight` → prefer `main` or `back`

This gives Kling better source material per shot.

### Files to Change

| File | Change |
|------|--------|
| `src/components/app/video/short-film/ReferenceUploadPanel.tsx` | Extend `ReferenceAsset`, fetch full product data, redesign product section UI with per-product cards and angle slots, update `pickProduct` to add all angles |
| `src/hooks/useShortFilmProject.ts` | Update `getSourceImageForShot` to prefer angle-specific images based on shot role |

