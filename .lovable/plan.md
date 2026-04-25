## Fix "Choose your product category" — correct images + accurate shot counts

The category chooser currently shows wrong shot counts (it counts subcategory chips, not real scenes) and uses generic preview images that don't match each category. I queried the live `product_image_scenes` catalog to get real scene totals per group and hand-picked one strong editorial/lifestyle preview per category.

### Changes

**1. `src/data/aiProductPhotographyCategories.ts`**
- Add a new `shotCount: number` field to `ProductPhotoCategory`.
- Replace each `previewImage` with a category-matching editorial shot pulled from the live catalog.
- Set real shot totals (aggregated across all related subcategories in the live catalog).

| Category               | Shot count | New preview (from live catalog)             |
|------------------------|-----------:|---------------------------------------------|
| Fashion                | 425        | Chair Studio Editorial (garments)           |
| Footwear               | 226        | Hard Shadow Hero (sneakers)                 |
| Beauty & Skincare      | 98         | Formula Smear Editorial                     |
| Fragrance              | 69         | In-Hand Lifestyle (fragrance)               |
| Jewelry                | 144        | Editorial Neck Portrait (necklaces)         |
| Bags & Accessories     | 389        | Reclined Studio Editorial (bags)            |
| Home & Furniture       | 60         | Color Hero Decor Campaign                   |
| Food & Beverage        | 115        | Sunburn Editorial Sip (beverages)           |
| Supplements & Wellness | 51         | Dose Preparation Editorial                  |
| Electronics & Gadgets  | 33         | Color Hero Tech Campaign                    |

**2. `src/components/seo/photography/PhotographyCategoryChooser.tsx`**
- Change the chip from `{cat.subcategories.length}+ shots` → `{cat.shotCount}+ shots` so it shows real catalog totals (425 instead of 8, etc.).

No other components need changes — the chooser is the only consumer of these fields.
