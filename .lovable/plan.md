

## Plan: Human-Readable Workflow URLs

### What Changes

Replace the UUID-based query parameter (`/app/generate?workflow=021146a4-...`) with clean, slug-based nested routes (`/app/generate/virtual-try-on`).

### How It Works

1. **Add a `slug` column to the `workflows` table** via migration. Populate it from existing workflow names (e.g., "Virtual Try-On Set" → `virtual-try-on-set`). Add a unique constraint.

2. **Add nested routes** in `App.tsx`:
   ```
   /app/generate/:slug   →  Generate page, looks up workflow by slug
   /app/generate          →  Redirects to /app/workflows (workflow picker)
   ```

3. **Update `Generate.tsx`** to read `slug` from `useParams()` instead of `searchParams.get('workflow')`. Query the workflow by slug instead of ID.

4. **Update navigation calls** in `Workflows.tsx` and `Dashboard.tsx` to use `/app/generate/${workflow.slug}` instead of `?workflow=${id}`.

### Changes Summary

| File | Change |
|------|--------|
| **Migration** | Add `slug TEXT UNIQUE` column to `workflows`, backfill from `name` |
| `src/App.tsx` | Change route from `/generate` to `/generate/:workflowSlug` |
| `src/pages/Generate.tsx` | Use `useParams().workflowSlug`, query by `slug` column |
| `src/pages/Workflows.tsx` | Navigate to `/app/generate/${workflow.slug}` |
| `src/pages/Dashboard.tsx` | Same navigation update |
| `src/components/app/WorkflowCard.tsx` | Pass slug in `onNavigate` if needed |

### Result

URLs become: `/app/generate/virtual-try-on-set`, `/app/generate/product-listing-set`, `/app/generate/image-upscaling`, etc.

