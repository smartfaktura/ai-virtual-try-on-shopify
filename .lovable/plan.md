

# Simplify Scene Count Display in Workflow Settings

## Problem
The workflow settings panel shows verbose text like "6 of 99 scenes selected · Will split into 2 batches" which is unnecessary detail for the user.

## Change
**File**: `src/components/app/generate/WorkflowSettingsPanel.tsx` (lines 469-473)

Replace the "X of Y scenes selected · Will split into Z batches" text with a simple count: **"6 scenes selected"**

```typescript
// Before:
<>{selectedVariationIndices.size} of {isFreeUser ? FREE_SCENE_LIMIT : PAID_SCENE_LIMIT} scenes selected
  {workflowImageCount > MAX_IMAGES_PER_JOB && (
    <span>· Will split into {batches} batches</span>
  )}
</>

// After:
<>{selectedVariationIndices.size} scene{selectedVariationIndices.size !== 1 ? 's' : ''} selected</>
```

Keep the zero-state "Select at least 1 scene to continue" message as-is.

