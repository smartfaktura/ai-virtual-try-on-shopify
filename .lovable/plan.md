

## Fix: Picture Perspectives Missing from Dashboard

### Root Cause
Picture Perspectives stores results in `freestyle_generations` (with `workflow_label` like `"Picture Perspectives — Front"`), not in `generation_jobs`. The Dashboard has two blind spots:

1. **Recent Jobs table** — only queries `generation_jobs`, never sees Perspectives
2. **Activity Feed** — queries `freestyle_generations` but doesn't fetch `workflow_label`, so Perspectives appear as generic "Freestyle" entries with ugly raw prompts

### Changes

**`src/pages/Dashboard.tsx`** — Recent Jobs section:
- Add a second query fetching recent `freestyle_generations` that have a `workflow_label` starting with `"Picture Perspectives"`
- Merge these into the `recentJobs` display as virtual job rows (with workflow name "Picture Perspectives", status "completed", credits from quality)
- Sort merged list by `created_at` descending, keep limit 5

**`src/components/app/ActivityFeed.tsx`** — Freestyle section:
- Add `workflow_label` to the freestyle query select
- When `workflow_label` exists, use it as the display text instead of "Freestyle" + raw prompt (e.g., `"Picture Perspectives — Front completed"`)
- Use a dedicated avatar for perspectives entries (e.g., prefix `perspectives-` to get a distinct team avatar)

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Fetch perspectives from `freestyle_generations` and merge into Recent Jobs table |
| `src/components/app/ActivityFeed.tsx` | Include `workflow_label` in query; display it instead of raw prompt for workflow items |

