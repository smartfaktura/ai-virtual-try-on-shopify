
## Product Specifications Input System

### Problem
The `dimensions` field exists on `user_products` table and is passed to `buildDynamicPrompt`, but is **never injected into the actual prompt**. AI improvises product dimensions, causing inaccurate results especially for furniture, bags, jewelry, and other size-critical products.

### Solution
Add a "Product Details" card at the top of Step 3 (before Model Selection) that shows category-aware specification fields per selected product. Only products **missing** dimension data are shown. Inject these values into the prompt builder.

---

### 1. Category-Aware Input Fields

Each product category gets specific dimension/spec fields. A free-text "Additional details" input is always shown.

| Category Group | Fields |
|---|---|
| **Furniture** (furniture) | Length, Width, Height (cm/in toggle), Seating capacity, Additional details |
| **Garments** (garments, dresses, hoodies, jeans, jackets, activewear, swimwear, lingerie, kidswear) | Size label (XS-3XL), Fit description, Length type (cropped/regular/long), Additional details |
| **Shoes/Sneakers/Boots/Heels** (shoes, sneakers, boots, high-heels) | Size (EU/US), Heel height, Shaft height (boots), Additional details |
| **Bags/Backpacks** (bags-accessories, backpacks, wallets-cardholders) | Width, Height, Depth, Strap length, Additional details |
| **Hats** (hats-small) | Brim width, Crown height, Additional details |
| **Watches** (watches) | Case diameter (mm), Band width (mm), Case thickness, Additional details |
| **Jewelry** (jewellery-*) | Ring size / Chain length / Stone dimensions depending on sub-type, Additional details |
| **Eyewear** (eyewear) | Lens width, Bridge width, Temple length, Additional details |
| **Fragrance** (fragrance) | Bottle volume (ml), Bottle height, Additional details |
| **Beauty/Skincare/Makeup** (beauty-skincare, makeup-lipsticks) | Container volume, Container type, Additional details |
| **Food/Beverages** (food, beverages) | Package weight/volume, Container dimensions, Additional details |
| **Home Decor** (home-decor) | Width, Height, Depth, Additional details |
| **Tech Devices** (tech-devices) | Screen size, Width, Height, Depth, Weight, Additional details |
| **Supplements** (supplements-wellness) | Container volume, Pill/capsule count, Additional details |
| **Default/Unknown** | Width, Height, Depth, Additional details |

### 2. UI: Product Specs Card in Step 3

- New card placed **before** the Model Selection card (top of "Complete setup")
- Header: "Product Specifications" with an Info icon and subtitle: "Add dimensions to improve accuracy"
- Shows only products where `product.dimensions` is empty/null
- If ALL selected products have dimensions filled, the card is hidden
- Each product shows its thumbnail + title + category-specific input fields
- Compact inline layout: dimension fields as small labeled inputs in a row
- "Additional details" as a textarea
- Values are stored in a new `DetailSettings` field: `productSpecs?: Record<productId, { dimensions?: string; specs?: Record<string, string>; notes?: string }>`
- Also persists to `user_products.dimensions` on change (so it's remembered next time)

### 3. Prompt Injection

In `productImagePromptBuilder.ts`:

**a) Add `productDimensions` to `TokenContext`:**
```
productDimensions?: string | null;
```

**b) In `buildDynamicPrompt`, pass dimensions into context:**
```
productDimensions: product.dimensions,
```

**c) Add dimension injection in both fallback and template paths:**
- After product title line, inject: `Product dimensions: {dimensions}.` when available
- For category-specific formatting:
  - Furniture: "Product dimensions: 180cm L x 80cm W x 75cm H, seats 4."
  - Garments: "Product size: M, relaxed fit, regular length."
  - Shoes: "Shoe size EU 42, heel height 3cm."
  - Bags: "Bag dimensions: 30cm W x 25cm H x 12cm D."
  - etc.

**d) Also inject `notes` (Additional details) as a product clarification line in the prompt.**

### 4. Data Flow

```
Step 3 UI input
  -> updates DetailSettings.productSpecs[productId]
  -> also patches user_products.dimensions in DB
  -> at generation time, ProductImages.tsx reads productSpecs
     and passes combined string to buildDynamicPrompt
  -> prompt includes "Product specifications: ..." line
```

### 5. Files to Create/Edit

| File | Change |
|---|---|
| `src/lib/productSpecFields.ts` | **NEW** — Category-to-fields mapping, field definitions |
| `src/components/app/product-images/ProductSpecsCard.tsx` | **NEW** — The UI card component |
| `src/components/app/product-images/types.ts` | Add `productSpecs` to `DetailSettings` |
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Insert `ProductSpecsCard` before Model Selection |
| `src/lib/productImagePromptBuilder.ts` | Add `productDimensions` to TokenContext, inject into prompt |
| `src/pages/ProductImages.tsx` | Pass specs to prompt builder, persist to DB |
