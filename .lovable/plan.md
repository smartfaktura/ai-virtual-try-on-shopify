

# Fix Skirts Category Not Mapping to Dedicated Scenes

## Problem
There are 36 dedicated skirt scenes in the database (`category_collection = 'skirts'`), but the product category detection maps skirt products to the generic `'garments'` bucket. Three things are missing:

1. **No `'skirts'` key in `CATEGORY_KEYWORDS`** — skirt keywords are buried inside `'garments'`
2. **No specificity override** from `'garments'` → `'skirts'` (exists for dresses, hoodies, jeans, jackets — but not skirts)
3. **`'skirts'` missing from `CATEGORY_SUPER_GROUPS`** Fashion & Apparel list

## Solution

**File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`**

### 1. Add `'skirts'` to `CATEGORY_KEYWORDS` (before `'garments'`)
```typescript
'skirts': ['skirt', 'mini skirt', 'maxi skirt', 'midi skirt', 'pleated skirt', 'pencil skirt', 'a-line skirt', 'wrap skirt', 'tulle skirt', 'tennis skirt'],
```

### 2. Add specificity override for garments → skirts
```typescript
["garments", /\bskirt\b|\bskirts\b/i, "skirts"],
```

### 3. Add `'skirts'` to Fashion & Apparel super group
```typescript
{ label: 'Fashion & Apparel', ids: ['garments', 'dresses', 'skirts', 'hoodies', 'jeans', 'jackets', 'activewear', 'swimwear', 'lingerie', 'kidswear', 'streetwear'] },
```

This ensures skirt products get matched to the 36 dedicated skirt scenes instead of falling into generic garments.

