

# Fix: Three Issues in Selfie / UGC Set Workflow

## Issues Found

### 1. Title still shows "Creating Virtual Try-On..."
The title fix from the previous change correctly reordered the conditions. However, the screenshot shows it still says "Creating Virtual Try-On..." — this suggests the `hasWorkflowConfig` variable is `false` for Selfie/UGC at this point.

Looking at the code: `hasWorkflowConfig = !!workflowConfig` where `workflowConfig = activeWorkflow?.generation_config`. If the Selfie/UGC Set workflow doesn't have a `generation_config` property, `hasWorkflowConfig` would be false, falling through to the try-on check. Need to also check `isSelfieUgc` in the title/subtitle conditions.

### 2. "Generation complete!" shows while still generating (5 of 6)
The `MultiProductProgressBanner` renders a `QueuePositionIndicator` at line 141-143 when `activeJob` exists. When one job completes, `activeJob.status` becomes `'completed'`, and the QueuePositionIndicator shows "Generation complete!" even though 5 of 6 jobs are done and 1 is still in progress. The banner should suppress the QueuePositionIndicator's completed state when not all jobs are done.

### 3. Male models not generating — only female results
The Selfie/UGC workflow routes through `handleWorkflowGenerate` (line 918), which only uses `selectedModel` (singular) — it never iterates over `selectedModels`. When 3 models are picked (Olivia, Marcus, Jin), only Olivia's data is sent to all jobs. The multi-model loop exists in `handleTryOnConfirmGenerate` but that path is skipped for `isSelfieUgc`.

---

## Plan

### File 1: `src/pages/Generate.tsx`

**A. Fix title/subtitle for Selfie/UGC (lines ~3829-3839)**
Add `isSelfieUgc` as an additional check alongside `hasWorkflowConfig`:
```
{isUpscale ? ... :
 (hasWorkflowConfig || isSelfieUgc) ? `Creating ${activeWorkflow?.name}...` :
 generationMode === 'virtual-try-on' ? 'Creating Virtual Try-On...' : ...}
```
Same for subtitle — add `isSelfieUgc` to the workflow subtitle branch.

**B. Fix multi-model generation in `handleWorkflowGenerate` (lines ~1034-1195)**
When `isSelfieUgc` and multiple models are selected, the single-product path must iterate over each model in `selectedModels`, not just use `selectedModel`. For each model, convert its image to base64 and include its data in the payload. This means the existing ratio × framing × variation loop also needs a model loop wrapping it, creating a separate job per model × variation × ratio × framing combo.

The multi-product path (lines 943-1021) has the same issue — it only uses `selectedModel` and needs the same multi-model loop.

### File 2: `src/components/app/MultiProductProgressBanner.tsx`

**C. Suppress "Generation complete!" when jobs are still in progress (line ~141-143)**
Don't pass `activeJob` to `QueuePositionIndicator` when `activeJob.status === 'completed'` but `completedCount < totalJobCount`. Replace the condition:
```tsx
{activeJob && activeJob.status !== 'completed' && (
  <QueuePositionIndicator job={activeJob} onCancel={onCancel} />
)}
```
This prevents showing the green "Generation complete!" banner prematurely while other jobs are still running.

---

## Summary of Changes
- 2 files modified
- Title/subtitle: add `isSelfieUgc` fallback so Selfie/UGC Set shows its workflow name
- Multi-model: wrap the workflow generation loop with a model iterator so all selected models get their own jobs
- Progress banner: hide "Generation complete!" indicator until all jobs are actually done

