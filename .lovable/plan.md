

# Layout Switcher for Workflow Catalog

## What Changes

### 1. Create a compact `WorkflowCardCompact` component
A new card variant for 2-col and 3-col grid layouts. Shows the animated thumbnail (square aspect ratio), workflow name, badge, a short description (2-line clamp), and a "Create Set" button. No feature bullet list — keeps it compact.

**File:** `src/components/app/WorkflowCardCompact.tsx`

### 2. Add layout switcher to Workflows page
- Store layout preference in `localStorage` (`workflow-layout`) with default `"rows"` (current full-width layout)
- Three toggle buttons with icons: Rows (list icon), 2-Col (grid-2 icon), 3-Col (grid-3 icon)
- On mobile/tablet (< 1024px): only show Rows and 2-Col options; force 2-col max
- Render logic:
  - `"rows"` → current `WorkflowCard` in `space-y-6` (unchanged)
  - `"2col"` → `grid grid-cols-1 sm:grid-cols-2 gap-4` using `WorkflowCardCompact`
  - `"3col"` → `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` using `WorkflowCardCompact`

**File:** `src/pages/Workflows.tsx` — add state, switcher UI, conditional rendering

### 3. Layout switcher UI
Place a small toggle group (using existing `ToggleGroup` from shadcn) right-aligned next to the "Create a New Set" section label. Uses `LayoutList`, `Grid2X2`, `Grid3X3` icons from lucide-react.

## Technical Details

- `WorkflowCardCompact`: vertical card with square thumbnail on top, content below. Reuses `WorkflowAnimatedThumbnail` and the same `onSelect` handler.
- Layout preference persisted in `localStorage` so it sticks across sessions.
- The `reversed` prop is only used in row layout; grid layouts don't alternate.
- Skeleton loaders adapt to selected layout.

