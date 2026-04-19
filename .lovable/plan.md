

The user wants me to fix the streetwear miscategorization. Based on the previous investigation, the issue is that Gemini broadly returns `garments` for streetwear items, and there's no specificity override.

## Fix

In `supabase/functions/analyze-product-category/index.ts`, add a **post-processing specificity override** that runs after Gemini's response: if Gemini returned `garments` (broad) but the title/description matches streetwear keywords, demote to `streetwear`. Same pattern can demote `garments` → `hoodies`, `jeans`, `dresses`, `jackets`, `activewear`, `swimwear`, `lingerie` when keywords match — fixing a whole class of "too broad" misclassifications, not just streetwear.

### Logic

After Gemini returns its answer, if `category === 'garments'`, run keyword check on `title + description`:
- `streetwear|graphic tee|oversized tee|urban wear|box logo|drop shoulder` → `streetwear`
- `hoodie|hooded sweatshirt|zip-up hoodie` → `hoodies`
- `jean|denim|skinny jean|wide-leg|mom jean` → `jeans`
- `dress|gown|maxi dress|midi dress|sundress` → `dresses`
- `jacket|blazer|bomber|puffer|parka|trench` → `jackets`
- `activewear|legging|sports bra|yoga|gym wear` → `activewear`
- `swimwear|bikini|swimsuit|swim trunks` → `swimwear`
- `lingerie|bra|underwear|corset` → `lingerie`
- `skirt|mini skirt|midi skirt|pleated skirt` → `skirts`

This runs **before** the existing `applyCategoryFallback`, so AI's specific answers still win — only `garments` triggers the demotion.

## File to edit

- `supabase/functions/analyze-product-category/index.ts` — add `refineGenericGarments(category, title, description)` helper, call it right after Gemini returns.

## Result

- "Streetwear hoodie", "graphic tee", "oversized tee" etc. are correctly classified as `streetwear` (or `hoodies`) instead of falling into the generic `garments` bucket.
- Existing AI-correct categorizations are untouched.
- Same fix benefits other commonly-broad answers (jeans, dresses, jackets, activewear).

