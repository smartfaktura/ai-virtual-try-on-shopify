

# Simplify Multi-Product Scene Selection

## Problems
1. **Same-category products get separate tabs unnecessarily** — if you select 3 clothing items, each gets its own tab even though they'd all use the same scenes. This is redundant and confusing.
2. **Product tabs aren't obviously clickable** — users don't realize they can switch between products to assign scenes.
3. **Continue button behavior is unclear** — it's not obvious that Continue will jump to the next incomplete product instead of advancing.

## Solution: Group by Category, Not by Product

### Core Change
Instead of one tab per product, group products by their detected category. Products sharing the same category share one scene selection. Only products in **different** categories get separate tabs.

**Example with 6 products:**
- 2 dresses + 1 scarf + 3 jeans → 3 groups: "Dresses (2)", "Scarves (1)", "Jeans (3)"
- Each group gets one scene selection that applies to all products in that group
- 3 clothing items all in "garments" → single shared picker (no tabs at all)

### Data Model
Replace `perProductScenes: Map<productId, Set<sceneId>>` with `perCategoryScenes: Map<categoryId, Set<sceneId>>`. During generation, each product uses the scenes assigned to its category group.

### UI Changes (ProductImagesStep2Scenes.tsx)

1. **Category group tabs** instead of product tabs:
   - Tab shows category name + product count + thumbnails: `"Dresses (2)" [👗👗]`
   - Badge shows selected shot count per group
   - Warning indicator if group has 0 shots

2. **Continue button behavior**:
   - If current group has shots selected but next group doesn't → auto-switch to next incomplete group with toast
   - If all groups have shots → advance to Step 3
   - Summary strip: `"Dresses → 4 shots · Scarves → 0 shots (needs shots)"`

3. **Single category = no tabs**: If all products resolve to the same category, use the existing shared picker with zero changes.

### ProductImages.tsx Changes
- Compute `categoryGroups: Map<categoryId, productId[]>` from product analyses
- Replace `perProductScenes` with `perCategoryScenes: Map<categoryId, Set<sceneId>>`
- Update `hasMultipleCategories` to use category groups
- Generation loop: look up each product's category → get scenes for that category
- Credit calc: sum per-category (scenes × products-in-category × imageCount)
- `canProceed` step 2: every category group has ≥1 scene
- `handleNext` step 2: find first empty category group, switch to it

### Files to Change

| File | Change |
|------|--------|
| `src/pages/ProductImages.tsx` | Replace `perProductScenes` with `perCategoryScenes`; compute `categoryGroups`; update generation loop, credit calc, validation |
| `src/components/app/product-images/ProductImagesStep2Scenes.tsx` | Replace product tabs with category-group tabs showing grouped thumbnails; update props; clearer tab styling with "Select shots for this group" header |
| `src/components/app/product-images/ProductImagesStep4Review.tsx` | Update review breakdown to show per-category-group instead of per-product |
| `src/lib/sceneVariations.ts` | Update `computeTotalImagesPerProduct` → `computeTotalImagesPerCategory` accepting category groups |

### Tab Design
- Larger, more button-like tabs with clear active state
- Each tab: category icon + "Dresses" + "(2 products)" + shot count badge
- Small product thumbnail row inside each tab
- Active tab has strong primary border + subtle background
- Empty tab has pulsing "Select shots →" label instead of just a warning icon

