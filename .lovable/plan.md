

# Debug Report + Food/Beverage Split Plan

## Issues Found

### Issue 1 (CRITICAL): Bag-referencing prompts still active in 7 categories

The previous fix only deactivated 5 scene *titles* (Interior View, On Shoulder Editorial, etc.) but the **remaining active scenes** in jewellery, belts, scarves, and wallets still have prompt templates that say "bag", "leather grain", "zipper pull", etc. This means ~96 active scenes across 7 categories will generate bag-related imagery for jewellery/belt/scarf products.

**Affected categories and counts of bad prompts:**
- jewellery-necklaces: 14 scenes with "bag" in prompt
- jewellery-earrings: 14
- jewellery-bracelets: 14
- jewellery-rings: 14
- belts: 13
- scarves: 13
- wallets-cardholders: 14

**Examples of broken prompts:** "Close-Up Detail" says "zipper pull, clasp, lock, buckle... leather grain"; "In-Hand Lifestyle" says "the bag should be the hero subject"; "Flat Lay Styled" says "items spilling out of the bag".

### Issue 2 (MINOR): Fashion categories have 3 scenes each with "bag" in prompt
`Packaging Detail`, `Product + Packaging`, and `Styled Outfit Flat Lay` in dresses/hoodies/streetwear etc. reference "bag" — less critical since these are generic packshot scenes where the word appears incidentally, but should be cleaned.

### Issue 3: No separate food vs beverages categories
Currently one `food-beverage` collection serves both. User wants `food` and `beverages` split.

---

## Fix Plan

### Step 1: Rewrite prompt templates for jewellery, belts, scarves, wallets (~96 UPDATEs)

For each of the 7 categories, UPDATE prompt templates to replace bag-specific language with category-appropriate language:
- **Jewellery**: Replace "bag" → "piece", "leather grain" → "metal finish", "zipper pull" → "clasp/setting", etc.
- **Belts**: Replace "bag" → "belt", context-appropriate references
- **Scarves**: Replace "bag" → "scarf/wrap", references to draping/folding
- **Wallets**: Replace "bag" → "wallet/cardholder"

This will be done with targeted SQL UPDATE statements using `REPLACE()` and manual prompt rewrites for scenes that need complete overhauls (e.g., "Flat Lay Styled" describing items spilling out of a bag).

### Step 2: Split `food-beverage` into `food` and `beverages`

**Database:**
- Clone all 16 `food-beverage` scenes → `food` collection
- Clone all 16 `food-beverage` scenes → `beverages` collection
- Add 2-3 unique scenes per new category:
  - **food**: Plating Detail, Bite/Cut Cross-Section, Recipe Context
  - **beverages**: Glass Pour, Condensation Detail, Can/Bottle Lineup
- Keep `food-beverage` active as a fallback (or deactivate — TBD)

**Code updates:**
- `types/index.ts`: Add `'food'` and `'beverages'` to TemplateCategory
- `categoryUtils.ts`: Split keywords — beverages (coffee, tea, juice, beverage, soda, wine, beer, water, kombucha, smoothie, energy drink) vs food (chocolate, cereal, granola, honey, jam, sauce, snack, candy, chips, protein bar)
- `analyze-product-category` edge function: Add both to valid categories + regex fallback
- `ProductImagesStep2Scenes.tsx`: Add CATEGORY_KEYWORDS entries
- `useProductImageScenes.ts`: Add TITLE_MAP entries
- `ProductImagesStep3Refine.tsx`: Add outfit preset fallbacks
- `categoryConstants.ts`: Add display labels and headlines

### Step 3: Fix minor "bag" references in fashion categories
Update ~27 prompt templates (3 per 9 garment-based categories) to use generic product language instead of bag-specific wording.

---

## Scale
- ~96 prompt template rewrites (jewellery/belts/scarves/wallets)
- ~27 minor prompt fixes (fashion categories)
- ~35 new scene records (food + beverages clones + unique)
- 6 code files updated
- 1 edge function updated

