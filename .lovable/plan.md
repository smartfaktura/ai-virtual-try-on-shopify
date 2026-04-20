

## Why "Wallets & Cardholders" is missing from the admin category dropdown

### Root cause
The category dropdown on `/app/admin/product-image-scenes` (when editing a shot) is built from a **hardcoded** `CATEGORY_GROUPS` array in `src/pages/AdminProductImageScenes.tsx` (lines 31–93). That array is out of sync with the rest of the app.

**Missing from the admin dropdown** but valid everywhere else (types, Step 2 product picker, `useProductImageScenes`, `categoryUtils`):
- Accessories: `backpacks`, `wallets-cardholders`, `belts`, `scarves`, `eyewear`, `watches`
- Footwear (currently only `shoes` exists): `sneakers`, `boots`, `high-heels`
- Jewelry group missing entirely: `jewellery-rings`, `jewellery-necklaces`, `jewellery-earrings`, `jewellery-bracelets`
- Fashion: `kidswear`

So when you edit a shot, the dropdown literally doesn't render those options — that's why Wallets & Cardholders isn't there.

### Fix
Update `CATEGORY_GROUPS` in `src/pages/AdminProductImageScenes.tsx` to match the canonical list used in `ProductImagesStep2Scenes.tsx` (`CATEGORY_LABELS` + `CATEGORY_GROUPS`).

New structure:
- **Fashion**: garments, dresses, hoodies, jeans, jackets, activewear, swimwear, lingerie, kidswear
- **Footwear**: shoes, sneakers, boots, high-heels
- **Bags & Accessories**: bags-accessories, backpacks, **wallets-cardholders**, belts, scarves, hats-small, watches, eyewear
- **Jewelry**: jewellery-rings, jewellery-necklaces, jewellery-earrings, jewellery-bracelets
- **Beauty & Fragrance**: beauty-skincare, makeup-lipsticks, fragrance
- **Home**: home-decor, furniture
- **Tech**: tech-devices
- **Food & Drink**: food, beverages
- **Wellness**: supplements-wellness
- **Other**: other

Single-file change. No DB migration. After deploy:
1. Open any shot in admin → category dropdown shows all 30+ options including Wallets & Cardholders.
2. Existing scenes already saved with `wallets-cardholders` continue working (they do today — issue is dropdown only).
3. New duplicates (like the recent jackets/dresses operations) can target Wallets & Cardholders.

### Validation
- Edit a shot → confirm Wallets & Cardholders appears under "Bags & Accessories" group.
- Confirm Sneakers/Boots/High-heels appear under "Footwear".
- Confirm Jewelry group renders with all 4 sub-types.
- Save and reload → category persists correctly.

