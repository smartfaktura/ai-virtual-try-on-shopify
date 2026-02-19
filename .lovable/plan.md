

## Fix Product Categories: From Clothing-Only to Universal

### The Problem

The product category/type system is hardcoded for clothing and fashion products in **4 separate places**, making the platform unusable for customers selling candles, tech gadgets, pet supplies, furniture, or anything outside fashion:

1. **ManualProductTab.tsx** (line 45-66): 65+ hardcoded types, heavily clothing-biased (T-Shirt, Hoodie, Leggings...). A candle seller sees mostly irrelevant options.

2. **UploadSourceCard.tsx** (line 33-36): Only 11 clothing types (Leggings, Hoodie, T-Shirt, Sports Bra...). Completely useless for non-clothing.

3. **analyze-product-image edge function**: AI prompt says "Analyze this image of a **clothing/fashion product**" and restricts productType to "One of: Leggings, Hoodie, T-Shirt, Sports Bra, Jacket, Tank Top, Joggers, Shorts, Dress, Sweater, Other". Any non-clothing product gets "Other".

4. **categoryUtils.ts**: Keyword-based detection only covers 5 categories (clothing, cosmetics, food, home, supplements). Everything else returns `null`.

### How Product Type is Actually Used

After tracing through all generation flows:

- **generate-product**: Passes `productType` into the prompt as context ("Type: {productType}")
- **generate-tryon**: Uses it in prompt ("Details: {description or productType}")
- **generate-workflow**: Uses `getProductInteraction()` which maps broad categories (skincare, clothing, food, tech, etc.) to interaction descriptions. Falls back to generic "holding the product naturally"
- **Freestyle**: Just displays it as a label, no generation impact
- **categoryUtils**: Used for template recommendations only

**Key insight**: The generation prompts use productType as free-text context. They don't validate against a fixed list. So we can use ANY descriptive type and it works fine.

### The Fix: Simple Free-Text Input with AI Smart Detection

Replace the rigid combobox with a **free-text input that accepts any product type**, plus improve the AI to detect any product category automatically.

**1. ManualProductTab.tsx -- Replace combobox with smart input**
- Replace the 65-item `PRODUCT_TYPES` array and Popover/Command combobox with a simple `Input` field
- Add a small set of **suggestion chips** (8-10 common ones) that users can tap to quickly fill
- Suggestions: Clothing, Footwear, Beauty, Skincare, Food, Drink, Home Decor, Electronics, Jewelry, Accessories
- User can type anything: "Ceramic Plant Pot", "Dog Harness", "Guitar Pedal" -- all valid
- Much simpler UI, works perfectly on mobile

**2. UploadSourceCard.tsx -- Same approach**
- Replace the 11-item Select dropdown with a simple Input field
- Remove the `productTypeOptions` array entirely
- The AI analysis will auto-fill this field anyway

**3. analyze-product-image edge function -- Make AI universal**
- Change the prompt from "clothing/fashion product" to "product"
- Remove the restricted "One of:" list for productType
- Instead: "productType: A short category label (e.g. 'Sneakers', 'Scented Candle', 'Face Serum', 'Wireless Earbuds', 'Dog Leash')"
- The AI will now correctly identify ANY product type

**4. categoryUtils.ts -- Add catch-all**
- Add more broad categories: "tech", "pets", "sports", "toys", "stationery"
- Keep the existing keyword matching but make it more inclusive
- This only affects template recommendations, not generation quality

### Files to Change

| File | Change |
|------|--------|
| `src/components/app/ManualProductTab.tsx` | Replace combobox with free-text Input + suggestion chips |
| `src/components/app/UploadSourceCard.tsx` | Replace Select dropdown with simple Input |
| `supabase/functions/analyze-product-image/index.ts` | Update AI prompt to detect any product, not just clothing |
| `src/lib/categoryUtils.ts` | Broaden keyword categories, add tech/pets/sports |

### Technical Details

**ManualProductTab.tsx:**
- Remove `PRODUCT_TYPES` array (lines 45-66)
- Remove `Popover`, `Command*` imports and the combobox JSX
- Replace with:
```
<Input
  value={productType}
  onChange={(e) => { setProductType(e.target.value); hasManualEdits.current.productType = true; }}
  placeholder="e.g. Scented Candle, Sneakers, Face Serum..."
/>
```
- Add suggestion chips below:
```
const QUICK_TYPES = ['Clothing', 'Footwear', 'Beauty', 'Skincare', 'Food & Drink', 'Home Decor', 'Electronics', 'Jewelry', 'Accessories', 'Pet Supplies'];
```
- Render as small tappable badges that fill the input on click

**UploadSourceCard.tsx:**
- Remove `productTypeOptions` array
- Replace `Select` with `Input` using same placeholder pattern

**analyze-product-image/index.ts:**
- Change prompt to: "Analyze this product image. Return a JSON object with: title, productType (a short descriptive category like 'Running Shoes', 'Scented Candle', 'Face Serum', 'Wireless Earbuds'), description"

**categoryUtils.ts:**
- Add `tech` category keywords: phone, laptop, headphone, speaker, charger, cable, gadget
- Add `pets` keywords: dog, cat, pet, collar, leash, harness
- Add to TemplateCategory type if needed, or keep returning `null` for truly unknown types (the fallback to 'universal' templates already handles this)

