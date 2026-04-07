

# Fix Missing Style/Outfit Presets for All Categories

## Problem
The `getBuiltInPresets()` function in `ProductImagesStep3Refine.tsx` returns an empty array when a category is not found in `CATEGORY_OUTFIT_CONFIG_DEFAULTS`. Currently only 7 of 12 categories have defaults defined. Missing: `home-decor`, `tech-devices`, `food-beverage`, `supplements-wellness`, `other`.

This means users whose products fall into those categories see zero style direction cards (Studio Standard, Editorial, Minimal, Streetwear, Luxury Soft).

## Fix

### File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`

**1. Add missing category defaults to `CATEGORY_OUTFIT_CONFIG_DEFAULTS`**

Add entries for the 5 missing categories. These are product-only categories (no model wearing the product), so the outfit config represents the person holding/presenting the product:

- `home-decor` — casual neutral (sweater + trousers)
- `tech-devices` — clean modern (t-shirt + jeans)
- `food-beverage` — warm casual (blouse/shirt + trousers)
- `supplements-wellness` — activewear/clean (tank top + joggers)
- `other` — fallback neutral (same as garments)

**2. Add a fallback in `getBuiltInPresets`**

Change line 831 from:
```typescript
if (!base) return [];
```
to:
```typescript
if (!base) base = CATEGORY_OUTFIT_CONFIG_DEFAULTS['garments'];
```

This ensures that even if a completely unknown category appears in the future, users still see the 5 built-in style presets using the garments defaults as a safe fallback.

**3. Add male overrides for the new categories**

Add entries in `MALE_OUTFIT_OVERRIDES` for the same 5 categories so male-model selections also get appropriate defaults.

## Impact
- All 12 product categories will show the 5 built-in style direction cards
- No database changes needed
- Single file change

