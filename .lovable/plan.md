

## Improve Dashboard Workflow Section

### Changes

**1. Limit workflow grid to max 2 per row**
Change `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` to `grid-cols-1 sm:grid-cols-2` so there are never more than 2 workflow cards per row.

**2. Add animated thumbnails (like the Workflows page)**
Replace the static `<img>` in each compact workflow card with the `WorkflowAnimatedThumbnail` component + IntersectionObserver visibility detection, exactly as the `WorkflowCard` does on the Workflows page. This brings the same slide-in, pop, shimmer, and "Generated" badge animations to the dashboard.

**3. Improve card design**
- Make the preview area `aspect-[4/5]` instead of `aspect-square` for a taller, more editorial feel that better matches the animated thumbnails
- Add a subtle hover scale transform on the image area
- Add the "Try-On" badge for workflows that use try-on
- Add a slightly larger card padding and better typography hierarchy
- Add `group` class for coordinated hover effects

### Technical Details

**File: `src/pages/Dashboard.tsx`**

In the "Explore Workflows" section (lines 219-253):

- Import `WorkflowAnimatedThumbnail` and `workflowScenes` from the existing animation data files
- Import `useRef, useState, useEffect` for IntersectionObserver
- Change grid classes to `grid-cols-1 sm:grid-cols-2 gap-6`
- Replace each workflow card's static `<img>` with a wrapper that:
  - Uses `useRef` + `IntersectionObserver` (threshold 0.3) to detect visibility
  - Renders `<WorkflowAnimatedThumbnail scene={scene} isActive={isVisible} />` when a matching scene exists in `workflowScenes`
  - Falls back to the static image when no animation scene is defined
- Keep the card structure: rounded-xl, border, name, description (1 line), and "Create Set" button
- Add `aspect-[4/5]` to the preview container for better proportions

Since IntersectionObserver logic is needed per-card, extract a small inline `DashboardWorkflowCard` component within Dashboard.tsx (or at the section level) that handles the ref/visibility state individually per card.

