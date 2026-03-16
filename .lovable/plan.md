

## Audit Results: Slug-Based Workflow URLs

### What's correct
1. **Database migration** — `slug` column added with unique constraint and backfill ✅
2. **Generate.tsx** — Reads `workflowSlug` from `useParams`, queries by slug, falls back to legacy `?workflow=` query param ✅
3. **Workflows.tsx** — Navigates to `/app/generate/${workflow.slug}` ✅
4. **Dashboard.tsx** — Navigates to `/app/generate/${slug}` ✅
5. **No legacy `?workflow=` links remain** anywhere in the codebase ✅
6. **Workflow type** updated with `slug` property ✅

### Issues found

**1. Route ordering bug — `/generate/bulk` is unreachable**

In `App.tsx` lines 137-139:
```
<Route path="/generate/:workflowSlug" />   ← catches "bulk" as a slug
<Route path="/generate" />
<Route path="/generate/bulk" />            ← never reached
```

The dynamic `:workflowSlug` route matches the literal `"bulk"` path before it can reach the static `/generate/bulk` route. **Fix**: Move `/generate/bulk` above `/generate/:workflowSlug`.

**2. Console warning — `AspectRatioSelector` ref forwarding**

`WorkflowSettingsPanel` passes a ref to `AspectRatioSelector` which is a function component without `forwardRef`. This is a pre-existing issue (not caused by the slug refactor) but worth noting — it's a React warning, not a crash.

### Plan

| File | Change |
|------|--------|
| `src/App.tsx` | Reorder: move `/generate/bulk` route **before** `/generate/:workflowSlug` |

That's the only fix needed. Everything else was implemented correctly.

