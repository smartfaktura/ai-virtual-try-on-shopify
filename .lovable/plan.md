

## Fix Dashboard "Generate Images" Button and Jobs "Unknown Product"

### Problem 1: "Generate Images" button goes to wrong page
The `DashboardQuickActions` component has `Generate Images` pointing to `/app/generate` (the workflow wizard). It should point to `/app/freestyle` (the Freestyle Studio).

**Fix in `src/components/app/DashboardQuickActions.tsx`**:
- Change path from `/app/generate` to `/app/freestyle`

### Problem 2: Jobs show "Unknown product" for all entries
The `generation_jobs` table has `product_id = NULL` for most jobs (workflow and freestyle generations don't always link a product). The dashboard query joins `user_products` via `product_id`, which returns null, so the fallback text "Unknown product" appears.

**Fix in `src/pages/Dashboard.tsx`**:
- When `product_id` is null but `workflow_id` exists, show the workflow name instead (e.g., "Mirror Selfie Set", "Product Listing Set")
- When both are null (freestyle), show "Freestyle Generation"
- Update the product image fallback: use the first result image from `results` array when no product image exists
- Change the column header from "Product" to "Source" to better reflect mixed content

### Technical Details

| File | Change |
|------|--------|
| `src/components/app/DashboardQuickActions.tsx` | Change "Generate Images" path to `/app/freestyle` |
| `src/pages/Dashboard.tsx` | Update job row to show workflow name or "Freestyle" when product is null; use result image as thumbnail fallback; rename column to "Source" |

