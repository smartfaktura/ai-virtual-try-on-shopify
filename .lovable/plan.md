

## Workflow Page Redesign -- Full-Row Split Layout

Replace the current 4-column grid of tiny cards with a stacked, full-width split layout where each workflow gets its own prominent row.

### Layout Concept

**Desktop (lg+):**
Each workflow is a full-width row split into two halves:
- **Left side**: Large animated thumbnail (aspect-ratio 3:4, taking ~45% width)
- **Right side**: Workflow name, description, feature highlights, badge, and CTA button -- all with generous spacing
- Alternating rows flip the layout (even rows: image left / text right, odd rows: image right / text left) for visual rhythm

**Tablet (md):**
- Same split layout but 50/50 columns, slightly reduced padding

**Mobile:**
- Stacked vertically: animation on top (full width, aspect-ratio 16:9 or 4:3 for more impact), text content below
- Larger text and buttons for touch targets
- Each workflow separated by generous spacing

### Design Details

- Each row gets a subtle card border with hover elevation
- Workflow name: `text-2xl font-bold` on desktop, `text-xl` on mobile
- Description: `text-base text-muted-foreground` with no line-clamp (full text shown)
- Feature bullets: 3-4 key points per workflow (derived from `required_inputs` and `uses_tryon`)
- Try-On badge: larger, more prominent positioning
- CTA button: `h-11 text-sm` with rounded-full styling, not crammed
- Animations auto-play when the row scrolls into view (using IntersectionObserver)
- Skeleton loading: 4 full-width placeholder rows instead of 8 tiny cards

### Files Changed

**`src/pages/Workflows.tsx`** -- Major rewrite
- Replace grid layout with vertical stack of `WorkflowRow` components
- Each row uses a flex layout with `flex-col lg:flex-row` and alternating `lg:flex-row-reverse`
- Add IntersectionObserver logic so animations play when visible
- Update skeleton loading to show full-width placeholder rows

**`src/components/app/WorkflowCard.tsx`** -- Repurpose as `WorkflowRow`
- Rename component to `WorkflowRow`
- Change from vertical card to horizontal split layout
- Left: Large animated thumbnail container (no longer tiny 3:4 card)
- Right: Spacious text area with name, full description, feature list, and CTA
- Accept `reversed` prop to flip image/text sides
- Accept `isVisible` prop to control animation playback (replaces hover-based autoPlay)
- Mobile: stack vertically with full-width image and text below

**`src/components/app/WorkflowAnimatedThumbnail.tsx`** -- Minor adjustment
- No structural changes needed -- it already fills its container
- The parent container just needs to be larger now

### No Backend Changes
This is purely a layout/presentation change. All data fetching and navigation logic stays identical.
