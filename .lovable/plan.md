

# Show Last-Edited Scene First in Admin Product Image Scenes

## Problem
The admin page at `/app/admin/product-image-scenes` sorts scenes by `sort_order` within each category group. There's no way to see which scene was most recently edited — it stays in its original position.

## Solution

### 1. Add `updated_at` column to `product_image_scenes` table
- **DB migration**: Add `updated_at TIMESTAMPTZ DEFAULT now()` column
- Add a trigger that auto-updates `updated_at` on every row update

### 2. Update `DbScene` interface
- **File: `src/hooks/useProductImageScenes.ts`** — add `updated_at: string` to the `DbScene` interface

### 3. Sort by `updated_at DESC` in admin page
- **File: `src/pages/AdminProductImageScenes.tsx`** — change the sorting inside the `grouped` memo from `arr.sort((a, b) => a.sort_order - b.sort_order)` to `arr.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())` so the most recently edited scene appears first within each category group

Note: The frontend-facing sort (in `useProductImageScenes` hook for the product images flow) stays sorted by `sort_order` — only the admin list changes.

### Files changed
1. **DB migration** — add `updated_at` column + auto-update trigger
2. `src/hooks/useProductImageScenes.ts` — add `updated_at` to `DbScene`
3. `src/pages/AdminProductImageScenes.tsx` — sort by `updated_at DESC` in admin view

