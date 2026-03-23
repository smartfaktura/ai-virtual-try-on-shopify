

# Update Workflow Card Names, Add Subtitles, Fix Mobile CTA

## Changes

### 1. `src/components/app/StartWorkflowModal.tsx`

**Update WORKFLOW_OPTIONS names** to include "Workflow" suffix:
- `'Product Editorial'` → `'Product Editorial Workflow'`
- `'Virtual Try-On'` → `'Virtual Try-On Workflow'`
- `'UGC / Selfie'` → `'UGC / Selfie Workflow'`

**Update WORKFLOW_CARDS mapping** — the `name` field maps to `workflowScenes` keys, so keep the scene-lookup name unchanged but pass a `displayName` via the description or a custom prop. Actually, the card name must match `workflowScenes` keys (`'Product Listing Set'`, `'Virtual Try-On Set'`, `'Selfie / UGC Set'`), so we keep that for animation lookup but pass a separate display name.

Approach: Add a `displayName` to each WORKFLOW_OPTIONS entry and pass it through to WorkflowCardCompact via a new prop.

### 2. `src/components/app/WorkflowCardCompact.tsx`

**Add `displayName` and `subtitle` props** — when provided, render `displayName` instead of `workflow.name`, and show `subtitle` below the name even in `modalCompact` mode.

**Fix mobile CTA fitting**: In `modalCompact` mode, reduce button text to just arrow icon or use `text-[10px]` and `h-6 px-2` to fit. Actually, better approach: use `text-[10px]` with shorter padding and keep "Start Creating →".

**Show subtitle in modal cards**: Add a small `text-[10px] text-muted-foreground` line below the card title showing the subtitle.

### Files
- `src/components/app/StartWorkflowModal.tsx` — update display names, pass subtitle prop
- `src/components/app/WorkflowCardCompact.tsx` — accept displayName/subtitle props, fix mobile button sizing

