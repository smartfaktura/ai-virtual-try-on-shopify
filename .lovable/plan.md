

# Rename "Virtual Try-On Set" → "Virtual Try-On Workflow" in Discover UI

## Problem
The card hover badge and detail modal show "Virtual Try-On Set" (the raw `workflow_name` from the DB). User wants it displayed as "VIRTUAL TRY-ON WORKFLOW" instead.

## Approach
Add a display transform function that replaces "Set" with "Workflow" in workflow names. This avoids changing DB data and applies everywhere the workflow name appears in Discover.

## Changes

### 1. `src/components/app/DiscoverCard.tsx`
Update `getGenerationLabel` (line 27): Replace "Set" suffix with "Workflow" in the workflow name:
```ts
if (d.workflow_name) return d.workflow_name.replace(/\bSet$/i, 'Workflow');
```

### 2. `src/components/app/DiscoverDetailModal.tsx`
Update `workflowLabel` (line 78-79): Same replacement:
```ts
const workflowLabel = isPreset && item.data.workflow_name
  ? `${item.data.workflow_name.replace(/\bSet$/i, 'Workflow')} Workflow`
```
Wait — this would produce "Virtual Try-On Workflow Workflow". The current code appends " Workflow" already. So just replace "Set" with nothing, or change the whole line:
```ts
const workflowLabel = isPreset && item.data.workflow_name
  ? item.data.workflow_name.replace(/\bSet$/i, 'Workflow')
  : isPreset ? 'Freestyle' : 'Scene';
```
This removes the extra " Workflow" suffix and replaces "Set" with "Workflow".

### 3. `src/components/app/PublicDiscoverDetailModal.tsx`
Same change to `workflowLabel` (line 52-54).

Three files, one-line changes each. All "Set" workflow names become "Workflow" in display only — DB data unchanged.

