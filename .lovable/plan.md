

# Unify Discover Category Dropdown in Detail Modal

## Problem
The Discover Detail Modal (`DiscoverDetailModal.tsx`, line 356) uses `DISCOVER_CATEGORIES` which shows raw slugs ("fashion", "beauty", "home", "food", "editorial", "cinematic", etc.) — 18 items including content-style tags. The Add Scene modal now uses `PRODUCT_CATEGORIES` with proper labels. These should match.

## Change

### `src/components/app/DiscoverDetailModal.tsx` (lines 355-358)
- Replace `DISCOVER_CATEGORIES` with `PRODUCT_CATEGORIES` (imported from `@/lib/categoryConstants`)
- Filter out `'any'` and use `cat.id` as value, `cat.label` as display text
- This gives the same 10 product categories with proper labels (e.g. "Fashion & Apparel" instead of "fashion")

One file, ~4 lines changed.

