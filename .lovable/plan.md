

## Clean Up Selfie / UGC Set Workflow Card

### Changes

**1. Remove "Try-On" badge from the title (WorkflowCard.tsx)**

The "Try-On" badge appears because the workflow has `uses_tryon: true` in the database. Rather than changing the database flag (which controls generation logic), we will hide the badge specifically for "Selfie / UGC Set" in the WorkflowCard component.

**2. Remove Creator circle and Plus icon from carousel overlay (workflowAnimationData.tsx)**

Remove two elements from the `'Selfie / UGC Set'` scene definition:
- The `type: 'model'` element (Creator avatar circle)
- The `type: 'action'` element (Plus icon)

This leaves only the Product chip ("Ice Roller") and the "UGC Style" badge as persistent overlays, alongside the "Generated" badge that the carousel component adds automatically.

### Files Modified

| File | Change |
|---|---|
| `src/components/app/WorkflowCard.tsx` | Hide "Try-On" badge for Selfie / UGC Set |
| `src/components/app/workflowAnimationData.tsx` | Remove Creator and Plus icon elements from UGC scene |

