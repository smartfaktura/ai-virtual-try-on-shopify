

## Fix: "View" Button in Recent Jobs Should Open the Job in Library

### Problem

The "View" button on completed jobs (line 484) navigates to `/app/generate?workflow=${job.workflow_id}`, which opens the Generate page for that workflow — not the actual generated results. For jobs without a `workflow_id`, it goes to `/app/library` with no filtering.

### Fix

**`src/pages/Dashboard.tsx`** (line 484)

Change the "View" button to navigate to the Library page with a search query pre-filled so the user sees the relevant results:

```typescript
onClick={() => navigate(`/app/library?search=${encodeURIComponent(job.user_products?.title || job.workflows?.name || '')}`)}
```

Alternatively, since each job has an `id`, we could open the `JobDetailModal` inline or navigate to library filtered by job ID. But the simplest effective approach is to navigate to `/app/library` with the product/workflow name as a search query — the Library page already supports `searchQuery` state, we just need to read it from URL params on mount.

**Changes needed in `src/pages/Jobs.tsx`**:
- On mount, read `search` from URL query params and initialize `searchQuery` state with it

**Changes needed in `src/pages/Dashboard.tsx`**:
- Update the View button `onClick` to navigate to `/app/library?search=<product or workflow name>`

Two files, ~3 lines each.

