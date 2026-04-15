

# Move Product Visuals to Top & Add Fast Carousel

## What We're Doing
1. Move the "Product Visuals" card to the top of the Workflows page (above Virtual Try-On)
2. Add a fast-rotating image carousel (0.5s interval) showing 20 editorial scene preview images on the Product Visuals card thumbnail

## Changes

### 1. Database Migration — Update sort_order
Set Product Visuals `sort_order` to `0` so it appears first:
```sql
UPDATE workflows SET sort_order = 0 WHERE slug = 'product-images';
```

### 2. Add workflowScenes entry for Product Visuals
**File:** `src/components/app/workflowAnimationData.tsx`

Add a new `'Product Visuals'` key to `workflowScenes` with:
- `mode: 'carousel'`
- `interval: 500` (0.5 second rotation, same as Catalog Studio)
- `backgrounds`: 20 scene preview URLs from `product_image_scenes` (editorial/campaign/stilllife types)
- Badges: "1000+ Scenes" and "Full Control" overlay badges
- No recipe section needed

This will make the WorkflowCard and WorkflowCardCompact automatically pick up the animated thumbnail instead of the static preview image, matching the existing carousel behavior used by Catalog Studio.

## Files Changed
- `src/components/app/workflowAnimationData.tsx` — add `'Product Visuals'` scene entry with 20 images
- Database migration — set `sort_order = 0`

