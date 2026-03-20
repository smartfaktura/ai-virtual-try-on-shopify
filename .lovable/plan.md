

# Fix Workflow Grid & Try-On Thumbnail

## Issue 1: 2-column grid not working on mobile
The grid uses `grid-cols-1 sm:grid-cols-2` — `sm:` kicks in at 640px, but mobile devices (390-414px) stay at 1 column. Fix: change to `grid-cols-2` as the base so it's always 2 columns in grid mode.

### Files
**`src/pages/Workflows.tsx`** — 3 places where the grid class is used (lines 481, 508, and the skeleton grid):
- Change `grid-cols-1 sm:grid-cols-2` → `grid-cols-2` for 2col layout
- Keep `lg:grid-cols-3` for 3col layout

## Issue 2: Virtual Try-On thumbnail should be top-aligned
The background image shows a woman's face — centering crops it out. Only this workflow needs `object-top`.

### Files
**`src/components/app/WorkflowAnimatedThumbnail.tsx`**:
- Add optional `objectPosition` field to the `WorkflowScene` interface
- Use `scene.objectPosition ?? 'center'` in all 4 `object-center` class locations (replace hardcoded `object-center` with a dynamic style)

**`src/components/app/workflowAnimationData.tsx`**:
- Add `objectPosition: 'top'` to the `'Virtual Try-On Set'` scene entry

