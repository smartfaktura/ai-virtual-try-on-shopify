

## Audit: `/app/generate/` Workflow Routing

### What's correct ✅

1. **Routes in App.tsx** — `/generate` and `/generate/:workflowSlug` are properly ordered (static first, dynamic second).
2. **Generate.tsx** — Reads `workflowSlug` from `useParams()`, queries by `slug` column, falls back to legacy `?workflow=` query param. Works correctly.
3. **Workflows.tsx** — Navigates to `/app/generate/${workflow.slug}` ✅
4. **Dashboard.tsx** — Quick-action cards navigate via `/app/generate/${slug}` ✅
5. **Perspectives redirect** — If a slug resolves to an angle-type workflow, it redirects to `/app/perspectives` ✅

### Issues found — 2 legacy navigation patterns remain

| File | Line | Current (legacy) | Should be |
|------|------|-------------------|-----------|
| `src/components/app/WorkflowActivityCard.tsx` | 250 | `` `/app/generate?workflow=${group.workflow_id}` `` | Look up the workflow slug and use `/app/generate/${slug}` |
| `src/components/app/GenerationModeCards.tsx` | 71 | `'/app/generate?mode=virtual-try-on'` | `'/app/generate/virtual-try-on-set'` (or resolve slug dynamically) |

These two files still use the old query-param pattern. They work because `Generate.tsx` has a fallback for `?workflow=`, but they produce ugly URLs and bypass the slug system.

**`Templates.tsx` line 42** uses `?template=` which is a *different* query param (template ID, not workflow ID) — this is fine and unrelated to the slug refactor.

**`Dashboard.tsx` lines 519/538** navigate to bare `/app/generate` (no workflow) for retry/empty-state CTAs — this is intentional and correct.

### Plan

| File | Change |
|------|--------|
| `src/components/app/WorkflowActivityCard.tsx` | Replace `?workflow=${group.workflow_id}` with slug-based URL. The component already has access to workflow data — use the slug if available, fall back to `?workflow=` if not. |
| `src/components/app/GenerationModeCards.tsx` | Replace hardcoded `?mode=virtual-try-on` with `/app/generate/virtual-try-on-set` |

Two small edits, no new files.

