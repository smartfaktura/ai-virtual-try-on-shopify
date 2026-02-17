

## Rewrite WorkflowPreviewModal to Match Library Modal Style

The previous edit failed to update `WorkflowPreviewModal.tsx` — it still uses the old Dialog-based layout. This plan fully rewrites it to match the `LibraryDetailModal` design pattern.

### Changes

**`src/components/app/WorkflowPreviewModal.tsx`** -- Complete rewrite

Replace the entire file with a fullscreen split-layout modal matching `LibraryDetailModal`:

| Aspect | Old (broken) | New |
|--------|-------------|-----|
| Container | `<Dialog>` / `<DialogContent>` | Fixed overlay `z-[200]` with `bg-black/90` backdrop |
| Layout | Single card popup | 60/40 split: image left, info panel right |
| Close | Dialog default X | Custom X button in info panel |
| Thumbnails | Side column with border | 2-column grid in info panel |
| Actions | Footer bar | Stacked buttons in info panel |
| Download errors | No feedback | `toast.error()` on failure |
| Body scroll | Not locked | `document.body.style.overflow = 'hidden'` |

**Structure:**
```text
[Fixed overlay z-200]
  [bg-black/90 backdrop, click to close]
  [flex md:flex-row, stopPropagation]
    [Left 60% - bg transparent]
      [Image centered with padding]
      [Left/Right nav arrows if multiple images]
    [Right 40% - bg-background/95 backdrop-blur-xl border-l]
      [X close button - top right]
      [Source label: "WORKFLOW" - uppercase tracking]
      [Title: workflow name - 2xl/3xl font]
      [Metadata: "4 images . 10 minutes ago"]
      [Thumbnail grid - 2 cols, clickable, ring on selected]
      [Download Image button - primary, full-width, h-12]
      [Download All (N) button - secondary, muted style]
      [View in Library link - ghost text]
```

**Key implementation details:**
- Body scroll lock via `useEffect` (same pattern as `LibraryDetailModal`)
- Escape key closes modal
- Arrow keys navigate images
- Download uses try/catch with `toast.error('Download failed')` and `toast.success('Image downloaded')`
- Signed URL loading shows shimmer placeholder
- No `Dialog` import needed -- pure div-based overlay

### Files to Modify

| File | Change |
|------|--------|
| `src/components/app/WorkflowPreviewModal.tsx` | Full rewrite to match LibraryDetailModal split-layout pattern |

