

## Returning user → dynamic copy on dashboard hero

### Detect returning user
Add a lightweight `useQuery` in `src/pages/Dashboard.tsx` that checks if the user has any completed `generation_jobs`:

```ts
const { data: hasGenerated } = useQuery({
  queryKey: ['dashboard-has-generated', user?.id],
  queryFn: async () => {
    const { count } = await supabase
      .from('generation_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'completed');
    return (count ?? 0) > 0;
  },
  enabled: !!user,
  staleTime: 5 * 60 * 1000,
});
```
RLS already scopes to the current user.

### Dynamic copy swaps
While `hasGenerated` is `undefined` (loading), keep the hero **stable** by defaulting to the new-user copy (avoid flicker). Once resolved:

| Element | New user | Returning user (`hasGenerated === true`) |
|---|---|---|
| H1 greeting | `Welcome, {name} 👋` | `Welcome back, {name} 👋` |
| Subtitle | `Your AI photography studio is ready. Choose how you want to start` (no period, per existing memory) | unchanged |
| Section H2 | `Start here` | `Continue creating` |
| Card 1 CTA | `Start creating` | `Create now` |

Cards 2 & 3 CTAs (`Open studio`, `Browse looks`) stay as-is. All other sections untouched.

### Subtitle period cleanup
While editing the subtitle line, also drop the trailing period on `Your AI photography studio is ready. Choose how you want to start.` → `Your AI photography studio is ready — choose how you want to start` (single sentence, no terminal period, matches Core memory rule).

### Acceptance
- New users (0 completed jobs): see `Welcome`, `Start here`, `Start creating`
- Returning users (≥1 completed job): see `Welcome back`, `Continue creating`, `Create now`
- No copy flicker on initial load (defaults to new-user copy until query resolves)
- Subtitle has no terminal period
- Out-of-credits banner logic unchanged

