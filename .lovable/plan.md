## Fix category page images + add per-category "Built for every category" section

The 10 `/ai-product-photography/{slug}` pages currently reuse a small pool of generic preview images that don't match each category (Bags page shows a watch, Jewelry shows fashion shots, Electronics shows handbags, etc.). The fix pulls real, category-matched previews from the live `product_image_scenes` catalog — the same source `/product-visual-library` uses — so every image is exactly on-topic for its page.

I queried the catalog and now have one verified preview per `(category_collection, sub_category)` pair across all 35 collections, so I can build accurate scene examples for every page.

### 1. Replace per-page imagery in `src/data/aiProductPhotographyCategoryPages.ts`

For each of the 10 category pages, replace `heroImageId` and the 8 `sceneExamples` with real previews from the matching collection(s). Each scene now uses the **actual subcategory** from the catalog as `category` (e.g. `Creative Shots`, `Editorial Studio Looks`, `Essential Shots`, `Editorial Wellness Routine`) so it matches exactly what users see on `/product-visual-library`.

| Page                          | Catalog collections used                                                                                  |
|-------------------------------|-----------------------------------------------------------------------------------------------------------|
| Fashion                       | `garments`, `dresses`, `jeans`, `jackets`, `hoodies`, `activewear`, `swimwear`, `lingerie`                |
| Footwear                      | `sneakers`, `shoes`, `boots`, `high-heels`                                                                |
| Beauty & Skincare             | `beauty-skincare`, `makeup-lipsticks`                                                                     |
| Fragrance                     | `fragrance`                                                                                               |
| Jewelry                       | `jewellery-rings`, `jewellery-necklaces`, `jewellery-earrings`, `jewellery-bracelets`                     |
| Bags & Accessories            | `bags-accessories`, `backpacks`, `wallets`, `belts`, `scarves`, `hats-small`, `eyewear`, `watches`        |
| Home & Furniture              | `home-decor`, `furniture`                                                                                 |
| Food & Beverage               | `food`, `snacks-food`, `beverages`                                                                        |
| Supplements & Wellness        | `supplements-wellness`                                                                                    |
| Electronics & Gadgets         | `tech-devices`                                                                                            |

### 2. Add a "Built for every category" section to every category page

Create a new component `CategoryBuiltForEveryCategory.tsx` that renders the same `One photo · Every shot — Built for every category.` section pattern from the homepage, but the chips (and revealed images) use this page's own `sceneExamples`. Each chip label uses the format the user requested:

> `Clothing & Apparel · Creative Shots`, `Clothing & Apparel · Essential Shots`, `Clothing & Apparel · Elevated Location Editorial`, `Clothing & Apparel · Editorial Studio Looks`

i.e. `{COLLECTION_LABEL} · {sub_category}`.

To support this, extend each `SceneExample` with two optional fields:
- `collectionLabel: string` (e.g. `"Clothing & Apparel"`)
- `subCategory: string` (e.g. `"Creative Shots"`)

Then `CategoryBuiltForEveryCategory` will:
- Render the eyebrow `One photo · Every shot` and heading `Built for every category.`
- Show a horizontally-scrollable chip rail built from the page's own scenes.
- Reveal the corresponding preview image when a chip is selected.

Mount the new section in `src/pages/seo/AIProductPhotographyCategory.tsx` between `CategorySceneExamples` and `PhotographyHowItWorks`.

### 3. Files touched

- `src/data/aiProductPhotographyCategoryPages.ts` — replace hero + scene example image IDs with real catalog matches; add `collectionLabel` + `subCategory` per scene; add `SceneExample` field types.
- `src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx` — new component (chips + active preview), styled to match the homepage section.
- `src/pages/seo/AIProductPhotographyCategory.tsx` — mount the new section.

### Expected result

- Every preview on every category page comes from that category's real scene library.
- Bags page shows real bags/wallets/eyewear/watches scenes (not a watch on green).
- Electronics page shows real tech device scenes (not handbags).
- Each page has a polished "Built for every category" chip selector using subcategory labels like `Clothing & Apparel · Creative Shots`.
