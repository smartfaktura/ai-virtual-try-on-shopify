

# Add "Furniture" as Valid Category in Product Analysis

## Problem
The `analyze-product-category` edge function has no `furniture` category in its valid categories list or title fallback patterns. Armchairs, sofas, tables etc. incorrectly fall into `home-decor`. The frontend already fully supports `furniture` as a separate category with correct keyword matching.

## Changes

### 1. Edge Function: `supabase/functions/analyze-product-category/index.ts`

**Add `furniture` to `VALID_CATEGORIES` set** (line 16, alongside `home-decor`)

**Add furniture title fallback pattern** to `TITLE_CATEGORY_PATTERNS` — before the `home-decor` pattern so furniture items match first:
```
[/armchair|sofa|couch|sectional|recliner|dining chair|office chair|accent chair|lounge chair|coffee table|dining table|desk|bookshelf|dresser|wardrobe|bed frame|nightstand|ottoman|cabinet|sideboard|credenza|tv stand|bar stool|bench|futon|mattress|furniture/i, "furniture"]
```

**Add specificity override**: `home-decor` → `furniture` when title matches furniture keywords (catches cases where AI returns `home-decor` for a sofa)

**Update the system prompt** `VALID CATEGORIES` list to include `furniture`

### 2. No frontend changes needed
The frontend (`ProductImagesStep2Scenes.tsx`, `useProductImageScenes.ts`, admin pages) already has full `furniture` support with labels, keyword arrays, and tab grouping.

## Impact
- 1 edge function file changed
- Existing products won't auto-reclassify (analysis runs at upload time) — user would need to re-upload or we could add a manual re-analyze button later
- New uploads of furniture items will correctly land in the Furniture recommended tab

