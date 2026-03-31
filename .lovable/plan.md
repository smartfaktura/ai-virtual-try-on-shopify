

## Fix Recent Creations Batch Grouping + Image Count Text

Two issues visible in the screenshots:

### Issue 1: Mirror Selfie Set jobs not grouped into one batch
The current grouping logic in `src/pages/Workflows.tsx` (lines 228-257) only merges jobs that share the **same `workflow_id` AND same `product_id`** within a 120s window. Multi-product batches (like Mirror Selfie Set with 3 products) have **different** `product_id` values, so they appear as separate cards.

**Fix**: Change the grouping to merge by `workflow_id` alone (drop the `product_id` match requirement) within the sliding 120s window. This matches how the activity feed groups batches.

**File**: `src/pages/Workflows.tsx` (lines 232-237)
- Remove the `lastGroup.workflow_id === row.workflow_id && row.product_id != null` condition that requires product_id match
- Replace with: merge when `workflow_id` matches and timestamps are within 120s window (regardless of product_id)

### Issue 2: "1 imgs" — incorrect plural
The count badge in `src/components/app/WorkflowRecentRow.tsx` (line 108) always shows "imgs" even when count is 1.

**Fix**: Use conditional plural — show "img" when count is 1, "imgs" otherwise.

**File**: `src/components/app/WorkflowRecentRow.tsx` (line 108)
- Change `{count} imgs` → `{count} ${count === 1 ? 'img' : 'imgs'}`

### Technical details

**Workflows.tsx grouping change** (around line 232):
```typescript
// Before: requires same product_id
if (lastGroup && lastGroup.workflow_id === row.workflow_id && row.product_id != null &&
    Math.abs(lastGroup.lastMergedTime - rowTime) <= 120_000)

// After: merge by workflow_id only within time window
if (lastGroup && lastGroup.workflow_id === row.workflow_id &&
    Math.abs(lastGroup.lastMergedTime - rowTime) <= 120_000)
```

**WorkflowRecentRow.tsx count label** (line 108):
```tsx
// Before
{count} imgs
// After  
{count} {count === 1 ? 'img' : 'imgs'}
```

