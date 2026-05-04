## Remove Fabric Fields from Apparel Specs

The product analyzer already detects fabric/material for apparel items, so these dropdowns are redundant. We'll remove them and add a small "Fabric detected by AI" note instead.

### Changes

**`src/lib/productSpecFields.ts`**
- Remove the `fabric` field from: garments, dresses, hoodies, jeans (denim), activewear, kidswear
- Keep `material` fields on non-apparel categories (bags, furniture, etc.) since those serve a different purpose (physical dimensions/construction)

**`src/components/app/product-images/ProductSpecsCard.tsx`**
- Add a subtle "Fabric is auto-detected from your product image" note below the spec fields grid for apparel categories (garments, dresses, hoodies, jeans, activewear, swimwear, lingerie, kidswear)
