## Replace flow header with per-step headers on `/app/generate/product-images`

Remove the redundant static "Create Product Visuals" page header from steps 1–4 (it duplicates the per-step heading) and ensure every step has its own title + subtitle directly above the stepper content.

### Mapping
| Step | Title | Subtitle |
|------|-------|----------|
| 1 Product | Select products | Choose one or more products to start generating visuals |
| 2 Shots | Select shots | Pick the shots you want to generate for your products (already present) |
| 3 Setup | Complete setup | Only a few choices are needed for selected shots (already present) |
| 4 Generate | Review & generate | A few last details left to fill (already present) |
| 6 Generating | (no header — unchanged) | |

### Changes

1. **`src/pages/ProductImages.tsx`** (~line 1371-1373)
   - Remove the `<PageHeader …>` block. Keep `<SEOHead>` so the browser tab title is unchanged.

2. **`src/pages/ProductImages.tsx`** Step 1 block (~line 1390)
   - Insert a small header above the toolbar:
     ```tsx
     <div className="mb-1">
       <h2 className="text-lg font-semibold tracking-tight">Select products</h2>
       <p className="text-sm text-muted-foreground mt-1">Choose one or more products to start generating visuals</p>
     </div>
     ```
   - Match the typography used by Step 2/3 H2s (`text-lg font-semibold tracking-tight`) so visual rhythm stays consistent.

3. No changes needed to steps 2, 3, 4 — their headers already exist.

No other logic, copy, or component changes.
