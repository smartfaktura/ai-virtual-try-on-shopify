

# Add Furniture Category & Split from Home Decor

## Concept
- **Furniture** = larger items (sofa, table, chair, bed, desk, shelf, cabinet, etc.)
- **Home Decor** = smaller tabletop/console items (candle, vase, frame, pillow, lamp, etc.)

Furniture detection rules placed **before** home-decor so specific matches win.

## Files to Update

### 1. Types — Add `'furniture'` to unions
- `src/types/index.ts` — add `'furniture'` to `TemplateCategory`
- `src/components/app/product-images/types.ts` — add `'furniture'` to `ProductCategory`

### 2. `src/lib/categoryUtils.ts`
- Add new furniture detection rule **before** the home-decor line (line 43):
```
furniture: ['sofa', 'couch', 'sectional', 'loveseat', 'armchair', 'recliner', 'chair', 'dining chair', 'office chair', 'accent chair', 'lounge chair', 'rocking chair', 'folding chair', 'bar stool', 'counter stool', 'stool', 'bench', 'ottoman', 'pouf', 'table', 'dining table', 'coffee table', 'side table', 'end table', 'console table', 'accent table', 'nightstand', 'bedside table', 'desk', 'standing desk', 'writing desk', 'vanity', 'bed', 'bed frame', 'headboard', 'bunk bed', 'daybed', 'futon', 'mattress', 'crib', 'shelf', 'bookshelf', 'bookcase', 'floating shelf', 'wall shelf', 'shelving unit', 'cabinet', 'filing cabinet', 'display cabinet', 'hutch', 'sideboard', 'buffet', 'credenza', 'dresser', 'chest of drawers', 'wardrobe', 'armoire', 'closet organizer', 'tv stand', 'media console', 'entertainment center', 'shoe rack', 'coat rack', 'wine rack', 'pantry', 'kitchen island', 'bar cart', 'furniture']
```
- Trim home-decor: remove `furniture` keyword from it
- Add `furniture: 'Furniture'` to `categoryLabels`

### 3. `src/components/app/product-images/ProductImagesStep2Scenes.tsx`
- Add `'furniture'` key with the same extensive keyword list to `CATEGORY_KEYWORDS` (before `home-decor`)
- Remove `'furniture'` from `home-decor` keywords
- Add `'furniture'` to `CATEGORY_ALIASES`: `"furniture": "furniture"`
- Add to `CATEGORY_SUPER_GROUPS` — move into `Home & Lifestyle` group: `['home-decor', 'furniture', 'tech-devices', 'supplements-wellness']`

### 4. `src/hooks/useProductImageScenes.ts`
- Add `furniture: 'Furniture'` to `TITLE_MAP`
- Change `home-decor` label from `'Home Decor / Furniture'` to `'Home Decor'`

### 5. `src/pages/AdminProductImageScenes.tsx`
- Add `{ value: 'furniture', label: 'Furniture' }` to `CATEGORIES` array
- Update `home-decor` label to just `'Home Decor'`

### 6. `src/pages/AdminBulkPreviewUpload.tsx`
- Add `furniture: 'Furniture'` to `TITLE_MAP`
- Update `home-decor` label to `'Home Decor'`

### 7. `src/pages/Generate.tsx`
- Add furniture detection keywords **before** homeKeywords (line 845)
- Remove `'furniture'` from homeKeywords
- Add `{ id: 'furniture', label: 'Furniture' }` to categories array (line 777)
- Add furniture detection in the productType check (line 3818)

### 8. `src/lib/productImagePromptBuilder.ts`
- Add `case 'furniture':` with appropriate defaults:
  - Background: `'styled interior room setting with architectural depth'`
  - Surface: `'positioned in a curated interior space on polished concrete or natural wood flooring'`
  - Lighting: `'Warm directional interior lighting with natural window-light ambience revealing material textures and wood grain.'`

### 9. `src/lib/categoryConstants.ts`
- No change needed (uses high-level product categories not collection IDs)

## Furniture Keywords (comprehensive list)

Seating: sofa, couch, sectional, loveseat, armchair, recliner, chair, dining chair, office chair, accent chair, lounge chair, rocking chair, folding chair, bar stool, counter stool, stool, bench, ottoman, pouf, bean bag

Tables: table, dining table, coffee table, side table, end table, console table, accent table, nightstand, bedside table, desk, standing desk, writing desk, vanity

Beds: bed, bed frame, headboard, bunk bed, daybed, futon, mattress, crib

Storage: shelf, bookshelf, bookcase, floating shelf, wall shelf, shelving unit, cabinet, filing cabinet, display cabinet, hutch, sideboard, buffet, credenza, dresser, chest of drawers, wardrobe, armoire, closet organizer

Media/Kitchen: tv stand, media console, entertainment center, shoe rack, coat rack, wine rack, kitchen island, bar cart, pantry

General: furniture

