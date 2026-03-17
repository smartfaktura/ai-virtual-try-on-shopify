

## Optimize Workflow Activity Card: Single Avatar + Mobile Layout

### Changes — `src/components/app/WorkflowActivityCard.tsx`

**1. Single rotating avatar instead of 3-avatar stack**

Replace the 3-avatar overlap with a single avatar that crossfades between team members every 3 seconds. This is cleaner and saves horizontal space (especially on mobile). Use CSS transition on opacity for smooth crossfade.

**2. Mobile-optimized card layout**

- **Active cards**: Stack vertically on mobile — avatar + name on top row, workflow info below, badges + cancel button on a third row. On desktop, keep horizontal layout.
- Use `flex-wrap` and responsive breakpoints to prevent text overflow and badge crowding.
- Move the time estimate text inline with the status info instead of on a separate indented line.
- Badges wrap naturally below on small screens.

**3. Completed/Failed cards**: Same single-avatar treatment. On mobile, wrap action buttons below the info text instead of forcing everything on one horizontal line.

### Implementation Details

- Single `Avatar` with `transition-opacity` crossfade keyed to `msgIdx`
- Green pulse dot on the avatar during processing
- Mobile: `flex flex-col` wrapper with `sm:flex-row` for desktop
- Completed cards: wrap badges and "View Results" button below text on mobile
- Failed cards: same wrapping pattern

