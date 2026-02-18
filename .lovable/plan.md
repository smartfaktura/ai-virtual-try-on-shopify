

## Expand Product Types + Fix Product Card Design

### Problem 1: Product Types Too Narrow
The current list has 26 clothing/beauty-focused types. Real-world products span many more categories. Need a comprehensive but organized list with an "Other" option (already exists but list needs expansion).

### Problem 2: Product Card Text & Layout Issues
From the screenshot, the imported product shows:
- Title truncated badly: "Cropped Sway Cr..." -- card is too narrow and text gets cut
- Product type badge shows raw imported value "Women:Outerwear:Coverups" which overflows the card
- Image thumbnail feels small relative to the card
- Overall card feels cramped

### Changes

#### 1. Expand Product Types (ManualProductTab.tsx)
Replace the current 26-item list with a comprehensive categorized list covering:
- **Apparel**: T-Shirt, Hoodie, Sweater, Pullover, Jacket, Coat, Blazer, Vest, Dress, Skirt, Pants, Jeans, Leggings, Shorts, Swimwear, Activewear, Underwear, Sleepwear
- **Footwear**: Sneakers, Boots, Sandals, Heels, Flats, Loafers, Slides
- **Accessories**: Bag, Handbag, Backpack, Wallet, Belt, Hat, Cap, Scarf, Gloves, Sunglasses, Watch, Jewelry, Ring, Necklace, Earrings, Bracelet
- **Beauty & Skincare**: Serum, Cream, Moisturizer, Cleanser, Toner, Mask, Lipstick, Foundation, Mascara, Perfume, Fragrance
- **Home & Living**: Candle, Mug, Pillow, Blanket, Lamp, Vase, Frame, Rug, Towel
- **Food & Beverage**: Food, Beverage, Supplement, Coffee, Tea, Snack
- **Tech & Electronics**: Phone Case, Headphones, Speaker, Charger
- **Other**: catches everything else

#### 2. Fix Product Card Layout (Products.tsx)
- Reduce grid to `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` (remove the 5-column breakpoint) so cards are wider
- Increase card content padding from `p-3` to `p-4`
- Allow title to wrap to 2 lines instead of truncating with `line-clamp-2` instead of `truncate`
- Truncate long product_type badges: if the type contains `:` or is longer than 20 chars, show only the last segment or truncate with ellipsis
- Add `space-y-1.5` for better vertical rhythm between title and badges

#### 3. Improve Badge Display for Imported Types
When a product type comes from an import (e.g., "Women:Outerwear:Coverups"), extract only the last meaningful segment ("Coverups") or truncate to fit. Apply `max-w-[120px] truncate` to the badge text.

### Files Modified
- `src/components/app/ManualProductTab.tsx` -- expanded PRODUCT_TYPES array
- `src/pages/Products.tsx` -- wider grid, better card padding/text handling, badge truncation
