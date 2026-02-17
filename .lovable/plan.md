

## Redesign Workflow Preview Modal and Fix Section Divider Layout

### 1. Fix "View All" button position in section divider

Currently the "Recent Creations" divider shows: `RECENT CREATIONS [View All ->] ──────`. The user wants the "View All" button on the far right, after the separator line: `RECENT CREATIONS ────────── [View All ->]`.

**File: `src/pages/Workflows.tsx`**
- Restructure the section-divider for "Recent Creations" so the line appears between the label and the button. Since `::after` pseudo-element creates the line, we need to wrap the label in a custom layout: use a flex container with the label, a `flex-1 h-px bg-border` div (manual line), and the button -- instead of relying on the `section-divider` class.

### 2. Redesign WorkflowPreviewModal to match Library modal style

Replace the current Dialog-based modal (which looks like a standard card popup) with a fullscreen split-layout modal matching `LibraryDetailModal`:

**File: `src/components/app/WorkflowPreviewModal.tsx`** -- Full rewrite of the modal:

- **Dark fullscreen overlay** (`bg-black/90`) instead of Dialog
- **Split layout**: Left side = large image preview (60% on desktop), Right side = info panel with actions (40% on desktop)
- **Info panel** contains:
  - Source label ("Workflow" in uppercase tracking)
  - Title (workflow name)
  - Metadata (image count, time ago)
  - Thumbnail grid for multi-image navigation
  - Download current image button (primary, full-width)
  - Download All as ZIP button (secondary)
  - View in Library link
- **Navigation**: Left/Right arrows on the image for multi-image sets
- **Close**: X button in top-right of info panel
- **Mobile**: Stack vertically (image top 45vh, panel bottom 55vh)
- **Keyboard navigation**: Arrow keys to switch images, Escape to close
- **Fix download**: Add try/catch with toast error feedback on download failures

### 3. Fix download error handling

The current `handleDownloadAll` has no error feedback. Add try/catch with `toast.error('Download failed')` for both single and zip downloads.

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/Workflows.tsx` | Replace section-divider for Recent Creations with manual flex layout so View All sits at end of line |
| `src/components/app/WorkflowPreviewModal.tsx` | Redesign as fullscreen split-layout modal matching LibraryDetailModal style, fix download error handling |

### Technical Details

**WorkflowPreviewModal new structure:**
```text
[Fixed overlay z-200]
  [bg-black/90 backdrop]
  [flex md:flex-row]
    [Left 60% - Image with nav arrows]
    [Right 40% - bg-background/95 panel]
      [X close button]
      [Source label: "WORKFLOW"]
      [Title: workflow name]
      [Metadata: count + time]
      [Thumbnail grid (2 cols)]
      [Download Image button - primary]
      [Download All (N) button - secondary]
      [View in Library link]
```

**Section divider fix:**
```text
Before: RECENT CREATIONS  View All ->  ──────────
After:  RECENT CREATIONS  ──────────  View All ->
```
