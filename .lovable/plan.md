

## Show Workflow-Specific Banner on Freestyle Page

### Problem
When a workflow generation is running, the Freestyle page shows the same generic "Generating your images..." indicator. But workflow results don't appear in Freestyle — they appear in the Workflows page or Library. Users are confused about where results will show up.

### Solution
Detect when the active job is a workflow type and show a workflow-specific banner instead of the generic `QueuePositionIndicator`. The banner will:
- Show "Workflow generation in progress" with the progress indicator
- Include a "View in Workflows" button linking to `/app/workflows`
- Explain that results will appear on the Workflows page

### Changes

**1. `src/hooks/useGenerationQueue.ts`** — Fetch `job_type` alongside existing fields in both the polling query and the restore query, and expose it on the `QueueJob` interface.

- Add `job_type` to `QueueJob` interface
- Add `job_type` to the poll fetch `select` parameter (line 95)
- Add `job_type` to the restore fetch `select` parameter (line 216)
- Map `row.job_type` into the job object

**2. `src/pages/Freestyle.tsx`** — Replace the `QueuePositionIndicator` block (lines 563-566) with a conditional:

```tsx
{activeJob && isProcessing && (
  <div className="px-3 lg:px-1 pt-1 pb-2">
    {activeJob.job_type === 'workflow' ? (
      // Workflow-specific banner
      <div className="flex flex-col gap-2 p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Workflow generation in progress...</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Results will appear on the Workflows page
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/app/workflows')}>
            View in Workflows
          </Button>
        </div>
        <Progress value={...} className="h-1.5" />
      </div>
    ) : (
      <QueuePositionIndicator job={activeJob} onCancel={() => resetQueue()} />
    )}
  </div>
)}
```

The workflow banner keeps a simple progress bar (reusing elapsed-based calculation) but replaces the team avatar rotation and generic messaging with clear workflow context and a navigation CTA.

### Files changed — 2
- `src/hooks/useGenerationQueue.ts` — Add `job_type` to QueueJob and fetch queries
- `src/pages/Freestyle.tsx` — Show workflow-specific banner with "View in Workflows" button when active job is a workflow type

