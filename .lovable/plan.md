

## Plan: Add defensive guards for undefined workflow slugs

The workflow data and routing code look correct — all workflows have slugs in the database, and the code fetches `select('*')`. However, to prevent the `/app/generate/undefined` issue (which may occur from stale cache or race conditions), I'll add defensive fallbacks in all places that navigate using `workflow.slug`.

### Changes

**1. `src/pages/Workflows.tsx`** (~line 343)
- Guard `handleCreateVisualSet`: if `workflow.slug` is falsy, fall back to `?workflow=${workflow.id}`

**2. `src/pages/Dashboard.tsx`** (~line 78 and ~line 330)
- Guard `onNavigate(workflow.slug)` call: use `workflow.slug || workflow.id` as fallback
- Guard the navigate callback: if slug looks like a UUID, use query param format instead

**3. `src/components/app/GenerationModeCards.tsx`** (~line 71)
- Already hardcoded to `virtual-try-on-set` — no change needed

**4. `src/components/app/WorkflowActivityCard.tsx`** (~line 250)
- Already has a ternary guard — no change needed

### Implementation detail

In all navigation points, replace:
```tsx
navigate(`/app/generate/${workflow.slug}`)
```
with:
```tsx
navigate(workflow.slug ? `/app/generate/${workflow.slug}` : `/app/generate?workflow=${workflow.id}`)
```

This ensures that even if `slug` is somehow `undefined` at runtime, users still land on a valid Generate page.

