

# Multi-Product Support for Text-to-Product

## Overview
Allow users to add multiple product descriptions in Step 1, then generate all selected scenes for each product. Total images = products × scenes.

## Changes

### `src/pages/TextToProduct.tsx` — Edit

1. **Replace single product state** with an array:
   ```typescript
   interface ProductEntry { id: string; title: string; specification: string; }
   const [products, setProducts] = useState<ProductEntry[]>([{ id: crypto.randomUUID(), title: '', specification: '' }]);
   ```

2. **Step 1 (Describe)** — Render each product as a collapsible card with title + specification fields. Add "＋ Add Another Product" button (max ~10). Each card has a remove button (except when only 1 remains). Show product count badge.

3. **Validation** — `canProceedFromDescribe` checks all products have title (>0 chars) and specification (>20 chars).

4. **Credit calculation** — `products.length × selectedScenes.length × 6`.

5. **Step 3 (Review)** — Show each product title + truncated spec, then scenes list, then total credits.

6. **`handleGenerate`** — Loop over products, building scenes array for each. Enqueue one job per product (each job contains that product's scenes with its specification injected into prompts). Use `paceDelay` between enqueue calls.

7. **Step 5 (Results)** — Group results by product title if multiple products were submitted.

### `supabase/functions/generate-text-product/index.ts` — No changes needed
The edge function already receives `scenes[]` with fully-baked prompts (specification already injected client-side). Each enqueued job is independent.

### `src/App.tsx` — No changes needed

## Summary
| What | Detail |
|------|--------|
| Files edited | 1 (`TextToProduct.tsx`) |
| New files | 0 |
| Edge function changes | None |
| Credit formula | products × scenes × 6 |

