

## Show Perspective Jobs in Workflows Activity

### Problem
The Workflows page filters all active/completed/failed jobs by checking `payload.workflow_id != null` (lines 57, 96, 135 of `Workflows.tsx`). Perspective jobs don't include a `workflow_id` in their payload — they only set `isPerspective: true` and `workflow_label`. So they're invisible in the Workflows activity section.

### Fix

#### 1. `src/hooks/useGeneratePerspectives.ts` — Add workflow metadata to payload

Add `workflow_id` and `workflow_name` to the payload so the existing Workflows page filters pick them up:

```typescript
payload: {
  ...existing fields,
  workflow_id: 'perspectives',           // synthetic but consistent ID
  workflow_name: 'Product Perspectives', // used by WorkflowActivityCard for display
}
```

Also pass `product` object with `title` so `product_name` extraction works in the activity card mapping (lines 69, 109, 149).

#### 2. No changes needed to `Workflows.tsx`

The existing filter `p?.workflow_id != null` and the mapping logic (`workflow_name`, `product_name`, `batch_id`, `quality`) will all work automatically once the payload includes these fields. The `WorkflowActivityCard` will display them identically to other workflow jobs.

### Files changed
| File | Change |
|------|--------|
| `src/hooks/useGeneratePerspectives.ts` | Add `workflow_id`, `workflow_name`, and `product` object to the enqueue payload |

