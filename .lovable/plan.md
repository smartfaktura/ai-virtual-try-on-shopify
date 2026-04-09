

# Enhanced Product Upload: Multi-Angle References + Extra Fields

## Context

Currently, the product upload form (`ManualProductTab`) captures: **title**, **product type**, **description**, **dimensions**, and a **single hero image**. The generation flow (`/app/generate/product-images`) already supports `backReferenceUrl` and `packagingReferenceUrl` — but these are uploaded ad-hoc during the Setup step (Step 3), not stored persistently with the product.

The `user_products` table has: `id`, `user_id`, `title`, `product_type`, `description`, `image_url`, `tags`, `dimensions`, `analysis_json`.

## What We'll Add

### Database: New columns on `user_products`
- `back_image_url` (text, nullable) — persistent back-view photo
- `side_image_url` (text, nullable) — persistent side-view photo  
- `packaging_image_url` (text, nullable) — persistent packaging photo
- `extra_image_urls` (text[], default `'{}'`) — up to 3 additional reference angles
- `weight` (text, nullable) — e.g. "250g", "1.2kg"
- `materials` (text, nullable) — e.g. "Italian leather, brass hardware"
- `color` (text, nullable) — primary color/finish description
- `sku` (text, nullable) — product SKU for internal reference

### Product Upload Form (`ManualProductTab`)
- **After the hero image**: Add an expandable "Reference angles (optional)" section with 3 small upload slots: Back View, Side View, Packaging
- **Extra fields section** (collapsible "More details" accordion):
  - Weight, Materials, Color, SKU inputs
  - These are all optional, collapsed by default to keep the form clean for casual users
- Batch mode: Each batch item gets the same optional fields (collapsed)
- Edit mode: Populate from existing data

### Auto-fill in Product Images Generation (Step 3 — Setup)
- When a product has `back_image_url` stored, auto-populate `details.backReferenceUrl` so the "Back View Reference" upload card shows the image pre-filled (user can still replace it)
- Same for `packaging_image_url` → `details.packagingReferenceUrl`
- Side view: inject as `extra_reference_image_url` for scenes with side-angle triggers
- The `dimensions` field is already passed to generation payload (line 397 of ProductImages.tsx) — confirmed working. New fields (`weight`, `materials`, `color`) will be added to the product object in the payload so the prompt builder can use them.

### Prompt Builder Enhancement
- `buildDynamicPrompt` already accepts `product.dimensions`. We'll extend the product parameter type to include `weight`, `materials`, `color`
- Add tokens: `{{productWeight}}`, `{{productMaterials}}`, `{{productColor}}` that resolve from product data
- These inject naturally into prompts (e.g., "250g glass bottle" gives the AI better scale/material context)

## Files to Change

1. **Database migration** — add 7 new columns to `user_products`
2. **`src/components/app/ManualProductTab.tsx`** — reference angle uploads + extra fields UI
3. **`src/components/app/AddProductModal.tsx`** — update `UserProduct` interface
4. **`src/pages/ProductImages.tsx`** — auto-fill back/packaging/side references from product data
5. **`src/lib/productImagePromptBuilder.ts`** — add weight/materials/color token resolution
6. **`src/components/app/product-images/types.ts`** — extend product type if needed (may auto-update from Supabase types)

## UX Notes
- All new fields are **optional** — zero friction for users who just want to drag-drop one image
- "Reference angles" section uses a subtle expandable card with small thumbnail upload slots (64×64px each)
- "More details" uses an accordion that starts collapsed
- Pre-filled references in Step 3 show a "(from product)" badge so users know the source

