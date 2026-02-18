

## Dashboard First-Run Improvements

### 1. Add "Two Ways to Create" Section (after AI Studio Team)

A new two-card section with **Freestyle Studio** and **Workflows** as the two paths. Each card will have an icon, title, short description, and a CTA button. This replaces the old Product Photos / Virtual Try-On split with the correct Freestyle / Workflows split.

- Placed directly after `<DashboardTeamCarousel />`
- Two side-by-side cards on desktop, stacked on mobile

### 2. Redesign "Explore Workflows" as Compact Cards

The current `WorkflowCard` is a large horizontal card designed for the dedicated Workflows page -- too big for the dashboard. Instead of reusing it, the dashboard will render **compact workflow cards** inline with:

- A **1:1 square preview image** (using the workflow's `preview_image_url` or animated thumbnail)
- **Workflow name** as a bold title
- **One-line description** (truncated)
- A compact "Create Set" button
- Grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` so they fit neatly in a row

### Technical Details

**Files to modify:**

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Add inline "Two Ways to Create" section (Freestyle + Workflows cards) after `DashboardTeamCarousel`. Replace the `WorkflowCard` usage with compact inline cards featuring 1:1 thumbnails, short text, and small CTAs. |

No new component files needed -- both sections will be rendered inline in the first-run dashboard block for simplicity.
