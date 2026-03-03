

## Fix: Multi-Product Workflow — Use Same Generation Flow Instead of Bulk Page

### Problem
When selecting 2+ products in any workflow (e.g., Product Listing Set), line 1712 navigates to `/app/generate/bulk` — a separate, old page using mock data and a completely different flow. The user wants multi-product selection to simply run the **same workflow generation** sequentially for each product, staying on the Generate page.

### Approach
Instead of routing to the bulk page, treat multi-product selection as a **product queue**: pick the first product as active, continue through the normal workflow steps (brand → settings → generate), and after each product completes, automatically advance to the next product and re-trigger generation with the same settings.

### Changes — `src/pages/Generate.tsx`

**1. Add multi-product queue state**
```tsx
const [productQueue, setProductQueue] = useState<Product[]>([]);
const [currentProductIndex, setCurrentProductIndex] = useState(0);
```

**2. Replace bulk navigation (line 1712)**
Instead of `navigate('/app/generate/bulk', ...)`, store all selected products in `productQueue`, set the first one as `selectedProduct`, and proceed through the normal workflow steps (same logic as the single-product path on lines 1695-1711).

**3. Auto-advance after generation completes**
When a generation result arrives (in the existing `useEffect` that watches `activeJob` or `batchState` completion), check if `productQueue` has more items. If so:
- Increment `currentProductIndex`
- Set the next product as `selectedProduct`
- Auto-trigger `handleWorkflowGenerate()` again with the same settings
- Show a progress indicator: "Product 2 of 5 — Generating..."

**4. Add multi-product progress banner**
When `productQueue.length > 1`, show a small banner above the generating view:
```
Generating for: Product Name (2 of 5) • 1 completed • 0 failed
```

**5. Collect results across products**
Store per-product results in a `Map<string, GenerationResult[]>` so the results step shows all generated images grouped by product, reusing the existing results UI.

### Files changed — 1
- `src/pages/Generate.tsx` — Add product queue state, replace bulk navigation, auto-advance on completion, add multi-product progress indicator

