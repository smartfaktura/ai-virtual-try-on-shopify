

## Fix: Recommended rail in /app/freestyle still shows only 12

The admin cap was bumped to 18, but the user-facing rail hook still uses its own constant of 12. They need to match.

### Change

**File:** `src/hooks/useRecommendedScenes.ts`

- Line 15: `const PER_BUCKET = 12;` → `const PER_BUCKET = 18;`
- Line 29 comment: update "capped at 12" → "capped at 18" for accuracy.

That's it. `PER_BUCKET` controls:
- the per-category `.limit()` on each `recommended_scenes` fetch (passes 1, 2, 3),
- the floor for `targetMax` (`Math.max(PER_BUCKET, userSubcategories.length * PER_BUCKET)`),

so bumping it lifts both the per-bucket fetch and the minimum visible count from 12 → 18 in one move. `HARD_CEILING = 60` already comfortably covers the new floor.

### Out of scope
- No DB changes.
- No UI changes to `SceneCatalogModal` — the "Recommended 12" badge is computed from `recommended.data.length`, so it'll automatically read 18 once data fills.
- No change to admin cap (already 18 from previous task).

