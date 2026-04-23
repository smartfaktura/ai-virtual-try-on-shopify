

## Increase recommended cap from 12 to 18 per category

Single constant change in the admin page so each category (Global + every sub-family) can hold up to 18 starred scenes instead of 12.

### Change

**File:** `src/pages/AdminRecommendedScenes.tsx`

- Line 57: `const RECOMMENDED_CAP = 12;` → `const RECOMMENDED_CAP = 18;`

That constant powers the "X / cap" counter, the disable-star-when-full logic, and the "category is full" toast — bumping it lifts all three in one move.

### Out of scope
- No DB schema change needed (no row limit at the table level).
- No change to the user-facing `useRecommendedScenes` rail logic — it already returns whatever rows exist.
- Skeleton placeholder count (line 664) stays at 12; it's a loading shimmer, not the real cap.

