

# Use Full Library Modal for Workflow Recent Creations

## Problem
Clicking a recent creation on `/app/workflows` opens `WorkflowPreviewModal` — a simplified modal with only download, upscale, perspectives, and "view in library". The Library and Freestyle pages use `LibraryDetailModal` which has full functionality (delete, copy settings, submit to discover, add as scene/model, etc.).

## Solution
Replace `WorkflowPreviewModal` usage in `WorkflowRecentRow` with `LibraryDetailModal`, converting the workflow job data to `LibraryItem` format — the same pattern `RecentCreationsGallery` already uses on the Dashboard.

## Changes

### File: `src/components/app/WorkflowRecentRow.tsx`
1. Remove `WorkflowPreviewModal` import, add `LibraryDetailModal` import and `LibraryItem` type
2. When a thumbnail is selected, convert the `RecentJob` into a `LibraryItem` (with signed URL, source: `'generation'`, label from workflow name, etc.)
3. For multi-image jobs, open the first image as a `LibraryItem` (user can navigate to others via Library)
4. Replace `<WorkflowPreviewModal>` with `<LibraryDetailModal>` at the bottom of the component

The conversion follows the same pattern as `RecentCreationsGallery.openItem()`:
```typescript
const libraryItem: LibraryItem = {
  id: job.id,
  imageUrl: signedUrlMap[job.id],
  source: 'generation',
  label: job.workflow_name ?? 'Workflow',
  date: new Date(job.created_at).toLocaleDateString(),
  createdAt: job.created_at,
};
```

No other files need changes. `WorkflowPreviewModal.tsx` can remain in the codebase (it may be used elsewhere or useful later).

