

## Fix Shopify Store Input Layout & UX

### Problem
The store name input looks disconnected — the label "Store name" is vague, the placeholder "mystore" doesn't clearly communicate what to enter, and the `.myshopify.com` suffix badge has a height mismatch (`h-9` vs the Input's `h-10`).

### Changes — `ShopifyImportTab.tsx`

1. **Fix height mismatch** — Change the suffix span from `h-9` to `h-10` to match the Input height
2. **Better label** — Change "Store name" to "Your Shopify store"
3. **Better placeholder** — Change "mystore" to "your-store-name" to be more descriptive
4. **Add helper text** — Add a small hint below the input: "Enter just your store name, without .myshopify.com"

All changes are in the not-connected state section (lines 283–298).

