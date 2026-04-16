

# Hide "Product Listing Set" from /app/workflows

## Problem
The "Product Listing Set" workflow is redundant now that "Product Visuals" exists. It should be hidden from the workflows page.

## Fix

### File: `src/pages/Workflows.tsx` (~line 53-60)

Add a client-side filter after fetching workflows to exclude `product-listing-set`:

```tsx
const { data: workflows = [], isLoading } = useQuery({
  queryKey: ['workflows'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .order('sort_order');
    if (error) throw error;
    // Hide deprecated workflows
    return (data as Workflow[]).filter(w => w.slug !== 'product-listing-set');
  },
});
```

This keeps the workflow in the database (so existing generation jobs, admin scenes, and references still work) but removes it from the user-facing workflow grid.

### Files
- `src/pages/Workflows.tsx` — 1 line filter addition

