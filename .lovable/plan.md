

## Batch Product Upload: Each Image = New Product (up to 10)

Currently, the manual upload flow treats all images as belonging to **one product**. The user wants to drop/select up to 10 images at once, where **each image creates a separate product** — with AI auto-filling details for each.

### How It Works

**New "Quick Add" mode in `ManualProductTab`** (non-edit mode only):

1. User drops/selects 1-10 images into the upload zone
2. If **1 image**: current single-product form (simplified to single image as previously planned)
3. If **2-10 images**: switch to a batch card grid view:
   - Each image shown as a card with auto-filled title, type, description from AI analysis
   - Users can inline-edit any field per card, or remove individual cards
   - A single "Add All Products" button saves them all
   - Progress bar shows upload + save progress across all products

### Technical Changes

**`src/components/app/ManualProductTab.tsx`**:
- Add `batchMode` state triggered when multiple files are dropped
- New `BatchProductCard` sub-component: compact card with image thumbnail + editable title/type/description
- AI analysis runs in parallel for each image (with concurrency limit of 3)
- On submit: upload all images to `product-uploads` bucket, insert all rows into `user_products` in sequence
- Each product gets its own `image_url` (single image per product, no `product_images` table needed)
- Remove the multi-image gallery (`ProductImageGallery`) from the manual flow entirely — single image per product
- Keep `MAX_IMAGES` renamed to `MAX_BATCH = 10`

**`src/components/app/ManualProductTab.tsx` — Single product flow**:
- When only 1 image is selected, show simplified single-image preview (no gallery strip) with the existing form fields
- Remove `ProductImageGallery` usage, replace with simple image preview + remove button

**No database changes needed** — each product is a separate `user_products` row with its own `image_url`.

### UI Layout for Batch Mode

```text
┌─────────────────────────────────────────────┐
│  10 products ready to add          [Add All]│
│─────────────────────────────────────────────│
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │ img1 │ │ img2 │ │ img3 │ │ img4 │  ...   │
│ │──────│ │──────│ │──────│ │──────│        │
│ │Title │ │Title │ │Title │ │Title │        │
│ │Type  │ │Type  │ │Type  │ │Type  │        │
│ │  ✕   │ │  ✕   │ │  ✕   │ │  ✕   │        │
│ └──────┘ └──────┘ └──────┘ └──────┘        │
└─────────────────────────────────────────────┘
```

### Files Changed — 1 file
- `src/components/app/ManualProductTab.tsx` — Rewrite to support single-image-per-product + batch mode (each image = new product, max 10)

