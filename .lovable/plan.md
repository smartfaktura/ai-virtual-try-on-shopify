

## Fix: Make Featured Sorting Visible to All Users

The featured item sorting is already wired into every Discover page (authenticated, public, dashboard, public freestyle). The problem is a single line — the query is gated behind `!!user`, so it never runs for logged-out visitors.

### Root Cause
`src/hooks/useFeaturedItems.ts` line 25: `enabled: !!user` prevents the query from executing for unauthenticated users.

### Fix

**File:** `src/hooks/useFeaturedItems.ts`

1. Remove the `useAuth` import and `user` dependency from `useFeaturedItems()` (keep it in `useToggleFeatured` — that one needs auth).
2. Change `enabled: !!user` to `enabled: true` (or remove the `enabled` property entirely).

The `get_public_featured_items` RPC is already a `SECURITY DEFINER` function designed for anonymous access, so no backend changes are needed.

```ts
export function useFeaturedItems() {
  const query = useQuery({
    queryKey: ['featured-items'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_featured_items');
      if (error) throw error;
      return (data as unknown as FeaturedItem[]) ?? [];
    },
  });
  // ... rest unchanged
}
```

That's it — one line change. All pages already consume `featuredMap` for sorting, so featured items will immediately appear at the top for all visitors.

