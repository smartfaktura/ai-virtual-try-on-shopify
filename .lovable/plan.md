## Match step headers across the Product Visuals flow

Steps 2 (Shots), 3 (Setup), and 4 (Generate) already have their own title + subtitle. Step 1 (Product) is missing one, and the static `<PageHeader title="Create Product Visuals" …>` at the top duplicates content on every step.

### Changes

**`src/pages/ProductImages.tsx`**

1. Remove the static `<PageHeader …>` block (~line 1371-1373) that renders on every step except 6. Keep `<SEOHead>` so the browser tab title is unchanged.
2. Add a Step 1 header above the toolbar, matching the visual rhythm of Steps 2/3/4:
   ```tsx
   <div className="mb-1">
     <h2 className="text-lg font-semibold tracking-tight">Select products</h2>
     <p className="text-sm text-muted-foreground mt-1">
       Choose one or more products to start generating visuals
     </p>
   </div>
   ```

### Result

| Step | Title | Subtitle |
|------|-------|----------|
| 1 Product | Select products | Choose one or more products to start generating visuals |
| 2 Shots | Select shots | Pick the shots you want to generate for your products (unchanged) |
| 3 Setup | Complete setup | Only a few choices are needed for selected shots (unchanged) |
| 4 Generate | Review & generate | A few last details left to fill (unchanged) |
| 6 Generating | (no header — unchanged) | |

No logic, copy, or other component changes.
