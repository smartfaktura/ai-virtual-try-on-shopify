
## Fix inconsistent section header sizing on Dashboard

The user is right — three section headers on `/app` (Dashboard) are using `text-lg font-semibold` while other sections (e.g. `DashboardDiscoverSection`, `RecentCreationsGallery`) likely use a larger/different style. Need to align all dashboard section headers to one ladder.

### Investigation needed
Read `DashboardDiscoverSection` and `RecentCreationsGallery` to see what heading style they use, then match the three inline sections (`Create Video`, `Your Products, In Motion`, `More tools`) to that same style.

### Change
Single file: `src/pages/Dashboard.tsx` — update the three `<h2>` blocks (lines ~167, ~213, ~232) to match the canonical section header style used by the other dashboard sections (likely `text-xl sm:text-2xl font-semibold` with matching subtitle treatment).

### Acceptance
- All section headers on `/app` use identical font-size, weight, and subtitle styling.
- No other changes.

### Files touched
- `src/pages/Dashboard.tsx`
