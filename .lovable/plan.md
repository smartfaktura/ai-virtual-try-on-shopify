The issue is not the admin scene label anymore. The screenshot is from the Product Images shot picker, which has its own category maps and detection logic. That code still does not know `wedding-dress`, so it falls back to the raw slug and cached AI analysis can still route bridal products to `dresses`.

Plan:

1. Fix the shot-picker label
   - Add `wedding-dress: 'Wedding Dress'` to the Product Images scene collection title map in `src/hooks/useProductImageScenes.ts`.
   - Add `wedding-dress: 'Wedding Dress'` to the local labels in `src/components/app/product-images/ProductImagesStep2Scenes.tsx`.

2. Fix Wedding Dress detection in the Product Images flow
   - Add `wedding-dress` to `CATEGORY_KEYWORDS` before generic `dresses`.
   - Include bridal terms like `wedding dress`, `bridal gown`, `bridal dress`, `wedding gown`, `bride gown`, `bridalwear`.
   - Add category aliases for `bridal`, `bridalwear`, `wedding_dress`, and similar values.
   - Add specificity overrides so existing cached categories like `dresses` or `garments` become `wedding-dress` only when the product title/type/description contains wedding or bridal intent.

3. Fix cached/AI category normalization on the Product Images page
   - Update `src/pages/ProductImages.tsx` so when it reads `analysis_json.category` or live analysis, it normalizes bridal/wedding products to `wedding-dress` instead of trusting stale `dresses`.

4. Fix the backend analyzer for future products
   - Update `supabase/functions/analyze-product-category/index.ts` valid category list and prompt to include `wedding-dress`.
   - Add bridal/wedding fallback and refinement patterns before the generic `dresses` rules.
   - Keep sport intent precedence, so “tennis dress” still stays `activewear`; only bridal/wedding terms become `wedding-dress`.

Expected result:
- The collapsed section displays **Wedding Dress** instead of `wedding-dress`.
- Wedding/bridal products are detected as **Wedding Dress**.
- Wedding Dress scenes are recommended/expanded for bridal products, including existing cached products when their metadata contains wedding/bridal terms.