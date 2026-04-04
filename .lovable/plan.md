

# Fix Category Detection + Prompt Builder Gaps

## Two Issues Found

### Issue 1: Jersey shows "Food & Beverage" recommendation
The `detectRelevantCategories` function in Step 2 uses naive substring keyword matching. The garments keyword list is missing common terms like "jersey", "jersey", "tank", "polo", "uniform", "tracksuit", "jogger", "vest", etc. Since no garment keyword matches "Basketball Jersey", and no other category matches either, the recommendation likely comes from stale `analysis_json` on the product row OR cached state. More importantly, the function should also leverage the AI-generated `analysis_json.category` when available, which would correctly classify the product.

### Issue 2: Refine options — prompt builder map gaps
Several UI chip values in Step 3 Refine don't have matching entries in the prompt builder maps, causing them to fall through to generic string replacements instead of rich prompt descriptions:

- **Background Family** (`BG_MAP`): UI uses `light-grey` but map has `light-gray`. Missing: `soft-white`, `taupe`, `stone`
- **Styling Direction** (`STYLING_DIRECTION_MAP`): Missing: `clean-commercial`, `fashion-editorial`, `beauty-clean`, `modern-sleek`

All other chip values (lighting, shadow, surface, hand style, nails, accent) correctly match their maps.

## Plan

### File 1: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

**A. Expand `CATEGORY_KEYWORDS`** — add missing terms:
- `garments`: add `jersey`, `tank`, `polo`, `uniform`, `tracksuit`, `jogger`, `vest`, `cardigan`, `blazer`, `suit`, `romper`, `jumpsuit`, `athletic`, `activewear`, `sportswear`, `basketball`
- `shoes`: add `trainer`, `mule`, `clog`, `pump`, `oxford`, `derby`
- `bags-accessories`: add `crossbody`, `messenger`, `duffel`, `case`, `pouch`
- `tech-devices`: add `monitor`, `console`, `controller`, `drone`, `wearable`

**B. Use `analysis_json` category when available** — accept an optional `analyses` prop (from `useProductAnalysis`) and merge AI-detected categories into the recommendation set:
```typescript
interface Step2Props {
  selectedSceneIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  selectedProducts: UserProduct[];
  productAnalyses?: Record<string, { category: string }>;
}
```
In `detectRelevantCategories`, also check `productAnalyses[p.id]?.category` and add it to the matched set.

### File 2: `src/lib/productImagePromptBuilder.ts`

**A. Fix `BG_MAP`** — add missing keys:
```typescript
'soft-white': 'soft warm white',
'light-grey': 'soft neutral light gray',  // match UI spelling
'taupe': 'warm taupe',
'stone': 'natural stone gray',
```

**B. Expand `STYLING_DIRECTION_MAP`** — add rich descriptions for all UI chip values:
```typescript
'clean-commercial': 'Clean commercial styling — crisp, professional composition optimized for product clarity and conversion.',
'fashion-editorial': 'Fashion editorial styling — elevated, magazine-quality composition with aspirational visual storytelling.',
'beauty-clean': 'Beauty-clean styling — luminous, minimal composition with soft tones and premium product focus.',
'modern-sleek': 'Modern sleek styling — contemporary, geometric composition with sharp lines and refined minimalism.',
```

### File 3: `src/pages/ProductImages.tsx`

Pass `analyses` from `useProductAnalysis` to Step 2 as `productAnalyses` prop.

## Files to Update

| File | Change |
|------|--------|
| `src/components/app/product-images/ProductImagesStep2Scenes.tsx` | Expand keywords, accept + use `productAnalyses` prop |
| `src/lib/productImagePromptBuilder.ts` | Add missing BG_MAP and STYLING_DIRECTION_MAP entries |
| `src/pages/ProductImages.tsx` | Pass analyses to Step 2 |

