

# Optimize Product Category Showcase — Prefix-Based + Fast Loading

## Problems
1. Code lists from subfolders (`showcase/fashion/`) but images are flat in `showcase/` with prefixes like `fashion-`, `skincare-`, `food-`, `home-`
2. All images render as `<img>` tags simultaneously (even unseen ones), wasting bandwidth
3. No width optimization — full-size images loaded for card-sized display

## Plan

| # | Change | Detail |
|---|--------|--------|
| 1 | **Single fetch, prefix filter** | One `list('showcase')` call, group files by prefix (`fashion-`, `skincare-`, `food-`, `home-`) |
| 2 | **Only load visible + next image** | Instead of rendering all `<img>` tags, only mount the current image and preload the next one — avoids downloading 15+ images at once |
| 3 | **Add width param** | Pass `width: 800` to `getOptimizedUrl` — cards are ~300px wide, 800px covers 2x retina comfortably |
| 4 | **Preload first image per category** | Eagerly load index-0 image so initial paint is instant; lazy-load the rest |

### Category → prefix mapping
- Fashion & Apparel → `fashion-`
- Beauty → `skincare-`
- Food & Drinks → `food-`
- Home & Living → `home-`

### File changed
- `src/components/landing/ProductCategoryShowcase.tsx`

Result: faster initial load (fewer images, smaller files), same visual experience, and you just drop new images into `showcase/` with the right prefix — no subfolders needed.

