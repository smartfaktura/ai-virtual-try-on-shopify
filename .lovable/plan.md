

## Analysis

The Shopify import tab (`ShopifyImportTab.tsx`) already has a proper multi-step wizard:
1. **Connect** — enter store domain + token
2. **Select** — browse/search products, check ones to import
3. **Importing** — progress bar
4. **Done** — summary

However, it's missing the **100-product-per-batch limit**. Currently:
- "Select All" selects every product with no cap
- No visual counter showing `X/100` selection limit
- No messaging explaining the 100-product batch limit
- Individual toggles don't prevent exceeding the limit

## Plan

**File: `src/components/app/ShopifyImportTab.tsx`**

Changes to the selection step only:

1. **Add a constant** `MAX_SHOPIFY_BATCH = 100` at the top of the file

2. **Cap `toggleSelect`** — prevent adding when `selectedIds.size >= 100`

3. **Cap `toggleAll`** — only select first 100 of filtered products; disable the "Select All" checkbox when total filtered products exceed 100 (show tooltip or note explaining why)

4. **Add a selection counter badge** — show `{selectedIds.size}/100` next to the "selected" text so users always see how close they are to the limit

5. **Disable unchecked product rows** visually (reduced opacity) when 100 are already selected

6. **Add a small info note** below the counter when products exceed 100: "Maximum 100 products per import. You can import more in additional batches."

No database or edge function changes needed — the backend already processes in batches of 10.

