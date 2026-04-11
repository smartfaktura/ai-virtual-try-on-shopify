

# Fix: Map All Subcategories to Prompt Builder Logic

## Problem
The `analyze-product-category` backend returns ~35 categories, but `productImagePromptBuilder.ts` switch statements only handle ~10. Subcategories like `dresses`, `hoodies`, `sneakers`, `boots`, `kidswear`, `eyewear`, `watches`, and all jewellery types fall to `default` — which applies wrong outfit/model/framing logic.

## Fix — `src/lib/productImagePromptBuilder.ts`

Update **all 7 category-aware switch functions** to map subcategories to their parent logic:

### Clothing subcategories → `garments` treatment
Add `case 'dresses': case 'hoodies': case 'streetwear': case 'jeans': case 'jackets':` alongside `case 'garments':` in:
- `resolveBodyFramingDirective` — full-body shot
- `defaultBackground` — warm white studio
- `defaultShadow` — soft diffused shadow
- `defaultStyling` — clean commercial
- `defaultLighting` — soft directional
- `defaultPersonDirective` — fashion model
- `categoryOutfitDefaults` — standard support clothing

### Footwear subcategories → `shoes` treatment
Add `case 'sneakers': case 'boots': case 'high-heels':` alongside `case 'shoes':` in all 7 functions.

### Accessory subcategories → `bags-accessories` treatment
Add `case 'backpacks': case 'wallets-cardholders': case 'belts': case 'scarves': case 'hats-small':` alongside `case 'bags-accessories':` in all 7 functions.

### Jewellery/watches/eyewear → beauty-adjacent treatment
Add `case 'jewellery-necklaces': case 'jewellery-earrings': case 'jewellery-bracelets': case 'jewellery-rings': case 'watches': case 'eyewear':` — treat like `bags-accessories` for outfit/framing (close-up/three-quarter with product focus), but with beauty-clean lighting and styling.

### Kidswear → special handling
Add `case 'kidswear':` with:
- `defaultPersonDirective`: child model directive (age-appropriate, playful)
- `categoryOutfitDefaults`: child-appropriate outfit defaults
- `defaultOutfitDirective`: add kidswear to the "product IS the outfit" check
- `resolveBodyFramingDirective`: full-body for children's clothing

### Also update `ProductCategory` type — `src/components/app/product-images/types.ts`
Add all missing categories to align with the backend: `lingerie`, `swimwear`, `activewear`, `kidswear`, `dresses`, `hoodies`, `streetwear`, `jeans`, `jackets`, `sneakers`, `boots`, `high-heels`, `backpacks`, `wallets-cardholders`, `belts`, `scarves`, `eyewear`, `watches`, `jewellery-necklaces`, `jewellery-earrings`, `jewellery-bracelets`, `jewellery-rings`

## Result
Every category the backend can return now has proper prompt handling — no more falling through to generic defaults that add wrong clothing or framing.

