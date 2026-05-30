# Upload review — analyze on grid, cleaner popup, grouped category picker

Refines the upload flow on `/app/generate/product-images` based on your feedback. No backend, no generation, no schema changes — purely the upload review UX.

## 1. Move "Analyzing…" out of the popup, onto the grid

Today the popup opens immediately and shows "Analyzing…" inside each row. Instead:

- When you pick/drop/paste images, **do not open the popup yet**.
- Show a temporary "analyzing" placeholder card on the product grid for each file, with the image thumbnail + a subtle spinner + "Analyzing…" label (matching the existing product card style).
- Run the AI category analysis in the background.
- Once **all** files finish analyzing (success or failure), the review popup opens with results already filled in.
- If a single file fails analysis, it still appears in the popup with category empty so you can pick manually.

Placeholder cards disappear when the popup opens. If you cancel the popup, the placeholders are cleared (nothing saved).

## 2. Cleaner review popup

- Remove the Sparkles icon from the title and the CheckCircle/AlertCircle icons next to each row.
- Title becomes simply: **Review uploads** (count moved into the confirm button only).
- Description shortened: *Confirm the category we picked, or change it*
- **Drop the title/name input** — names are auto-generated, you said it's noise.
- Each row shows: thumbnail · category dropdown (with a small "Suggested" badge next to the dropdown when the value came from AI and hasn't been changed) · remove (×) button.
- The "Suggested" badge disappears the moment you change the category, so you can tell at a glance which ones you've reviewed.

## 3. Mobile-first popup layout

- Single-column stack on mobile: thumbnail (64px) on the left, category dropdown + Suggested badge on the right, remove button top-right corner.
- Footer buttons stay side-by-side but full-width on mobile.
- Max height tuned so the list scrolls inside the dialog on small screens.

## 4. Grouped category dropdown

The flat 35-item alphabetical list is replaced with grouped sections inside the same `Select` (using `SelectGroup` + `SelectLabel`), with subcategories under each parent:

```text
Apparel
  Dress, Garment, Hoodie, Jacket, Jeans, Trousers, Activewear,
  Swimwear, Lingerie, Kidswear
Footwear
  Sneakers, Shoes, Boots, Heels
Bags & Accessories
  Bag, Backpack, Wallet, Belt, Scarf
Headwear
  Cap, Hat, Beanie
Jewellery & Watches
  Watch, Necklace, Ring, Bracelet, Earring
Eyewear
  Eyewear
Beauty & Fragrance
  Fragrance, Skincare, Makeup
Food & Beverage
  Food, Beverage
Home & Tech
  Furniture, Home Décor, Tech Device
Wellness & Pets
  Supplement, Pet Accessory
Other
  Other
```

Trigger still shows the resolved label (e.g. "Dress"). Grouping is presentation-only — the stored `category` value is unchanged, so all downstream prompt logic, scenes, and saved products keep working exactly as before.

## Files touched

- `src/components/app/BulkUploadReviewModal.tsx` — strip icons + title input, add Suggested badge, grouped Select, mobile layout, expose analysis result via a new path so the parent can pre-analyze.
- `src/pages/ProductImages.tsx` — change `openUploadReview` to first run analysis and render placeholder cards on the grid, then open the modal with prepared rows.
- `src/lib/productSpecFields.ts` — add a `CATEGORY_GROUPS` constant (presentation-only) used by the dropdown. No change to existing exports.

## Out of scope

- No changes to `analyze-product-image` edge function, `user_products` schema, scene logic, generation, billing, or any other page.
- No change to the "More options" path (still opens `AddProductModal`).
- No change to category values stored in DB.
