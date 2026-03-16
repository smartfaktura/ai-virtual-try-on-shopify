

## Audit: All `/app/generate/` Navigation Patterns

### Summary

Everything is correctly using slug-based URLs **except one remaining legacy pattern**.

### What's correct ✅

| Location | Pattern | Status |
|----------|---------|--------|
| `Workflows.tsx` | `navigate(\`/app/generate/${workflow.slug}\`)` | ✅ Slug |
| `Dashboard.tsx` workflow cards | `navigate(\`/app/generate/${slug}\`)` | ✅ Slug |
| `Dashboard.tsx` retry / empty CTA | `navigate('/app/generate')` (no workflow) | ✅ Intentional |
| `GenerationModeCards.tsx` | `navigate('/app/generate/virtual-try-on-set')` | ✅ Slug |
| `Templates.tsx` | `navigate(\`/app/generate?template=${templateId}\`)` | ✅ Different system (template IDs, not workflow IDs) |
| `Generate.tsx` | Reads `workflowSlug` from `useParams`, falls back to `?workflow=` | ✅ Backward-compatible |

### One remaining legacy pattern

| File | Line | Current | Issue |
|------|------|---------|-------|
| `WorkflowActivityCard.tsx` | 251 | `` `/app/generate?workflow=${group.workflow_id}` `` | Uses legacy query param with UUID |

This is the "Retry" button on failed workflow activity cards. The `BatchGroup` type only has `workflow_id` (UUID) and `workflow_name`, but no slug.

### Plan

**Option A (simple, no data model change):** Derive the slug from `workflow_name` using the same slugification logic (lowercase, replace spaces with hyphens). Add a `workflow_slug` field to `BatchGroup` and populate it by looking up the slug from the workflows list already fetched on the Workflows page.

**Option B (minimal, keep fallback working):** Leave as-is. `Generate.tsx` already has a fallback that reads `?workflow=` and looks up by UUID. The URL is uglier but functional.

### Recommended: Option A

| File | Change |
|------|--------|
| `src/lib/batchGrouping.ts` | Add `workflow_slug: string \| null` to `BatchGroup` interface |
| `src/pages/Workflows.tsx` | When mapping queue jobs to `ActiveJob`, also extract `workflow_slug` from payload (add it to the payload in Generate.tsx) |
| `src/pages/Generate.tsx` | Add `workflow_slug: activeWorkflow?.slug` to the payload sent to `enqueue-generation` (for both single and multi-product paths) |
| `src/components/app/WorkflowActivityCard.tsx` | Use slug-based URL: `` `/app/generate/${group.workflow_slug}` `` with fallback to `?workflow=` if slug is missing |
| `src/components/app/GlobalGenerationBar.tsx` | Extract `workflow_slug` from payload alongside `workflow_name` |

This ensures all future queue jobs carry the slug in their payload, and the retry button uses clean URLs. Existing jobs without a slug in their payload will fall back to the legacy `?workflow=` pattern gracefully.

