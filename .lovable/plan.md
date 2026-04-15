

# Remove Explore Templates & Team Carousel from Dashboard

## Changes

**File: `src/pages/Dashboard.tsx`**

1. **Remove "Explore Templates" section** (lines 487-510) — the workflow cards grid. Users will find these in the Visual Studio.

2. **Remove "Your AI Studio Team" section** (line 514) — the `<DashboardTeamCarousel />` component. Will be placed elsewhere later.

3. **Clean up unused imports** — remove `DashboardTeamCarousel` import and `DashboardWorkflowCard` if no longer used. Also remove `workflows` fetch logic if it's only used for this section.

## Result
The dashboard will show: Quick-start cards → Discover section → Feedback banner → Recent creations gallery. Clean and focused for new users.

## Files changed
- `src/pages/Dashboard.tsx` — remove two sections + unused imports

