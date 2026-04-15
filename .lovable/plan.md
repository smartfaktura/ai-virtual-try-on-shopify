

# Fix "More tools" card routes

## Summary
Update the three route strings in the More tools cards to point to the correct pages.

## Changes

**File: `src/pages/Dashboard.tsx` (line 464-466)**

| Card | Current route | Correct route |
|------|--------------|---------------|
| Picture Perspectives | `/app/generate/product-images` | `/app/perspectives` |
| Image Upscaling | `/app/workflows` | `/app/generate/image-upscaling` |
| Catalog Studio | `/app/workflows` | `/app/catalog` |

