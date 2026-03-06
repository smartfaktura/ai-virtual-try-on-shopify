

## Remove "Image downloaded" Toast Overlay

The green "Image downloaded" toast overlaps the UI after downloading. The fix is simple: remove the `toast.success('Image downloaded')` calls from all download handlers. The browser's native download indicator already confirms the download — the toast is redundant and blocks the view.

### Files Changed

**`src/pages/Generate.tsx`** — Remove `toast.success('Image downloaded')` from the download handler (~line 1177)

**`src/components/app/LibraryDetailModal.tsx`** — Remove `toast.success('Image downloaded')` (~line 67)

**`src/components/app/WorkflowPreviewModal.tsx`** — Remove both `toast.success('Image downloaded')` calls (~lines 102, 115)

All `toast.error('Download failed')` calls will remain so the user still gets notified on failure.

