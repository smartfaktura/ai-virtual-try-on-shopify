

# Improve Products Page: Filters, Views, and Multi-Image Support

## Overview

Three major improvements to the Products experience:
1. Enhanced Products page with filters and grid/list view toggle
2. Multi-image support for products (upload multiple, set primary)
3. Store import updated to pull all product images

---

## 1. Products Page Redesign

### Filter Bar
Add a horizontal filter bar below the search with:
- **Product Type** filter: dropdown showing all unique types from user's products (e.g., Candle Sand, Serum, T-Shirt)
- **Sort by**: Newest first, Oldest first, Name A-Z, Name Z-A
- Active filters shown as dismissible badges

### View Toggle (Grid / List)
- **Grid view** (current): 5-column card layout with thumbnails
- **List view** (new): Full-width rows showing:
  - Thumbnail (64x64)
  - Product name (full, not truncated)
  - Product type badge
  - Description (truncated to 1 line)
  - Number of images (e.g., "3 photos")
  - Date added (e.g., "Feb 8, 2026")
  - Edit / Delete actions on the right

Toggle icon buttons (LayoutGrid / List) in the top-right area next to "Add Product".

---

## 2. Multi-Image Support

### Database Change
Create a new `product_images` table:

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| product_id | uuid | Foreign key to user_products |
| user_id | uuid | For RLS |
| image_url | text | Signed URL |
| storage_path | text | Path in product-uploads bucket |
| position | integer | Order (0 = primary) |
| created_at | timestamptz | Default now() |

RLS policies: users can only CRUD their own images. The existing `user_products.image_url` column will continue to hold the primary image URL for backward compatibility and fast queries.

### Manual Upload Tab Changes
- Allow uploading multiple images (up to 6)
- Show a horizontal scrollable row of image previews
- First uploaded image is automatically the primary
- Users can click a "star" icon on any image to set it as primary
- Drag-and-drop or click to add more images

### Products Page: Image Count
- Show a small badge on product cards (e.g., "3") if the product has more than 1 image
- In list view, show "X photos" text

### Product Detail / Edit
- When editing a product, show all images in a mini gallery
- Allow reordering, deleting individual images, or adding more
- Click the star/crown icon to change the primary image

---

## 3. Store Import: Extract All Images

### Edge Function Update
Update the AI prompt in `import-product/index.ts` to extract ALL product images (not just the primary). The response format changes to include an `images` array:

```text
- "image_urls": array of all product image URLs (absolute)
```

After extraction, download and upload ALL images to the product-uploads bucket, then insert rows into `product_images` for each.

---

## Technical Details

### Files Created

**Migration SQL** (via migration tool)
- Create `product_images` table with RLS policies
- Add index on `product_id` and `user_id`

### Files Modified

**`src/pages/Products.tsx`**
- Add state for `viewMode` ('grid' | 'list'), `typeFilter`, and `sortBy`
- Add a query to fetch product image counts from `product_images`
- Add filter bar component with product type dropdown and sort selector
- Add view toggle buttons (LayoutGrid / List icons)
- Add list view rendering with full product info rows
- Update grid view cards to show image count badge

**`src/components/app/ManualProductTab.tsx`**
- Change from single file state to `files: File[]` array (max 6)
- Show horizontal preview strip with star (primary) and X (remove) buttons
- Upload all files to storage, insert into `product_images` table
- Set the first image as `image_url` on the `user_products` record

**`src/components/app/AddProductModal.tsx`**
- Widen the modal slightly to accommodate the multi-image preview strip

**`supabase/functions/import-product/index.ts`**
- Update AI prompt to extract `image_urls` array (all product images)
- Download and upload all images (up to 6) to storage
- Return the full array in the response

**`src/components/app/StoreImportTab.tsx`**
- Handle the new `image_urls` array from the import response
- Show all extracted images in the preview
- Insert all images into `product_images` on save

**`src/components/app/freestyle/ProductSelectorChip.tsx`**
- No changes needed -- it already uses `image_url` (primary) which stays the same

### New Component

**`src/components/app/ProductImageGallery.tsx`**
- Reusable mini gallery for showing/managing multiple product images
- Used in both the ManualProductTab (during upload) and in a future product edit view
- Shows images in a horizontal strip with star (set primary) and X (delete) controls
- "Add more" button at the end

