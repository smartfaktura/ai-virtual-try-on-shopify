

# Dynamic Product Category Showcase from Storage

## What changes

Make the `ProductCategoryShowcase` component dynamically fetch images from the `landing-assets` storage bucket instead of using hardcoded file paths. Each category gets its own subfolder.

## Storage folder structure

```text
landing-assets/
  showcase/
    fashion/        ← Fashion & Apparel images
    beauty/         ← Beauty images
    food/           ← Food & Drinks images
    home/           ← Home & Living images
```

## How it works

1. Define categories with their folder prefix (e.g. `fashion`, `beauty`, `food`, `home`)
2. On mount, call `supabase.storage.from('landing-assets').list('showcase/fashion')` etc. for each category
3. Build optimized public URLs, shuffle per category
4. Fall back to current hardcoded images if a folder is empty or fetch fails
5. Keep existing crossfade + progress bar rotation logic

| # | Action | Detail |
|---|--------|--------|
| 1 | Update `ProductCategoryShowcase.tsx` | Replace hardcoded arrays with dynamic fetch per category folder |
| 2 | Keep fallback images | Current hardcoded URLs used if storage folder is empty |

**Your workflow after this:** Upload images to `landing-assets → showcase → fashion/` (or `beauty/`, `food/`, `home/`). They appear automatically on next page load.

