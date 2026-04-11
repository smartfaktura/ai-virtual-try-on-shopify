

# Fix: Per-Product Reference Uploads in Step 3

## Problem
When multiple products are selected, the reference upload cards (back view, side view, interior, texture, packaging, atomizer, etc.) show only once globally. The user has no way to know which product they're uploading a reference for, and all products end up sharing the same single reference image. These references are **product-specific** — each product has its own back, side, interior, etc.

## Current Architecture
- `details.backReferenceUrl` / `details.packagingReferenceUrl` — single global values
- `sceneExtraRefs` — flat map like `{ "trigger:sideView": "url" }` — also single global values
- Auto-fill logic (ProductImages.tsx line 287) only reads from `firstProduct`
- Generation prompt builder receives one reference per trigger type

## Proposed Solution

### Data Model Change
Convert reference storage from global to **per-product** keying:

```
// Before (global)
sceneExtraRefs = { "trigger:backView": "url" }
details.backReferenceUrl = "url"

// After (per-product)  
sceneExtraRefs = { "trigger:backView:product-uuid-1": "url1", "trigger:backView:product-uuid-2": "url2" }
details.backReferenceUrl → removed, migrated to sceneExtraRefs pattern
details.packagingReferenceUrl → removed, migrated to sceneExtraRefs pattern
```

### UI Change in Step 3 (ProductImagesStep3Refine.tsx)

**Single product selected**: No change in appearance — show reference cards as today (no product disambiguation needed).

**Multiple products selected**: For each product-specific trigger (backView, sideView, interiorDetail, textureDetail, packagingDetails, and all REFERENCE_TRIGGERS), render a **per-product section**:

```text
┌─────────────────────────────────────────────┐
│ 📷 Back view reference                      │
│ Upload a back photo for each product.       │
│                                             │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│ │ [thumb]  │  │ [thumb]  │  │ [thumb]  │   │
│ │Product A │  │Product B │  │Product C │   │
│ │ ✅ Done  │  │ +Upload  │  │ +Upload  │   │
│ └──────────┘  └──────────┘  └──────────┘   │
│                                             │
│ "2 of 3 uploaded"                           │
└─────────────────────────────────────────────┘
```

Each product card shows:
- Product thumbnail (from `image_url`)
- Product name (truncated)
- Upload button or uploaded reference preview with remove option
- Auto-filled indicator if pre-populated from product data

### Auto-Fill Logic (ProductImages.tsx)
Update to iterate **all** selected products (not just first), storing per-product keys:
```
for each product:
  if product.back_image_url → sceneExtraRefs["trigger:backView:{product.id}"] = url
  if product.side_image_url → sceneExtraRefs["trigger:sideView:{product.id}"] = url
  // etc.
```

### Generation Prompt Builder
Update the prompt assembly to read per-product references when building each product's generation job. The key format `trigger:{type}:{productId}` makes lookup straightforward.

**Backward compatibility**: If the old global key `trigger:{type}` exists (no product ID suffix), treat it as applying to all products (graceful migration).

## Files Changed

| File | Change |
|------|--------|
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Refactor reference upload sections to render per-product cards when `productCount > 1`; update upload/remove handlers to use product-keyed refs |
| `src/pages/ProductImages.tsx` | Update auto-fill logic to iterate all selected products; migrate `backReferenceUrl`/`packagingReferenceUrl` to sceneExtraRefs pattern |
| `src/lib/productImagePromptBuilder.ts` | Update reference image lookup to use per-product keys with global fallback |
| `src/components/app/product-images/types.ts` | Remove `backReferenceUrl` and `packagingReferenceUrl` from `DetailSettings` (optional cleanup) |

## Scope Note
This is a significant refactor touching the data flow from Step 3 → Review → Generation. I'll preserve backward compatibility with the old global keys so existing in-progress sessions don't break.

