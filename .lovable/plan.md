
## Fix Product Selector + Generate Scene Preview Images

Two issues to fix:

### Issue 1: Product selector shows mock data instead of real products

The user products query on line 132 of `Generate.tsx` has `enabled: !!user?.id && !!activeWorkflow?.uses_tryon`. Since Product Listing Set is NOT a try-on workflow, the query never runs and the product step falls back to `mockProducts`.

**Fix**: Change the `enabled` condition to always fetch user products when a user is logged in (remove the `uses_tryon` check). Then update the product step (line 861) to show real user products for ALL workflows, not just try-on ones. The `ProductMultiSelect` component will be updated to accept `UserProduct[]` mapped to `Product[]`.

### Issue 2: Scene preview cards show gradient placeholders instead of real images

The `generate-scene-previews` edge function exists and the `workflow-previews` bucket is ready, but previews haven't been generated yet. We need to trigger the generation.

**Fix**: Deploy the edge function and call it to generate the 8 scene background preview images. The function will use Gemini Flash to create background-only images for each scene (Hero White, Marble Surface, Natural Texture, etc.), upload them to storage, and update the workflow's `generation_config` with the URLs.

---

### Technical Changes

**`src/pages/Generate.tsx`**:

1. **Line 132**: Change the user products query `enabled` from `!!user?.id && !!activeWorkflow?.uses_tryon` to just `!!user?.id` so it always fetches real products
2. **Lines 815-863**: Update the product step to show real DB products for ALL workflows (not just try-on). The try-on branch already renders user products nicely -- extend this pattern to all workflows. When `userProducts` exist, show them; fall back to `mockProducts` only if no user products are found
3. Map `UserProduct` to `Product` format using the existing `mapUserProductToProduct` helper for the continue handler (lines 877-893)

**`supabase/functions/generate-scene-previews/index.ts`**:
- Deploy the existing edge function and invoke it for the Product Listing Set workflow to generate all 8 scene background images

### Files Changed
- **Edit**: `src/pages/Generate.tsx` -- fix product query + product selection step to use real DB products for all workflows
- **Deploy + Invoke**: `generate-scene-previews` edge function to populate scene preview images
