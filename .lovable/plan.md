

## Dashboard Code Review — Findings & Fixes

After reviewing all dashboard components (`Dashboard.tsx` at 760 lines, plus 12 child components), here's the assessment:

### Overall Verdict
The code is well-structured with good patterns (lazy loading, IntersectionObserver, staleTime caching, optimistic placeholders). A few issues found — mostly minor performance/correctness items, no critical bugs.

---

### Issues Found

#### 1. Redundant Data Fetching (Performance)
**File:** `Dashboard.tsx`

The dashboard fires **10 separate queries** on mount for a returning user. Several overlap:
- `recentJobs` query (line 158) fetches generation_jobs + freestyle_generations
- `ActivityFeed` component independently fetches the same tables again
- `generatedCount` query (line 202) fetches generation_jobs again
- `RecentCreationsGallery` fetches generation_jobs + freestyle_generations again

**Fix:** No code change needed — React Query deduplicates by `queryKey`, and these use different keys intentionally (different columns/filters). The queries are lightweight (`head: true` for counts). This is acceptable.

#### 2. `creditUsageProgress` calculation is unused (Dead code)
**File:** `Dashboard.tsx`, line 357
```ts
const creditUsageProgress = Math.round(((300 - balance) / 300) * 100);
```
This variable is computed but never rendered. Also hardcodes 300 as the monthly quota, which may not match all plans.

**Fix:** Remove the unused variable.

#### 3. `topWorkflow` query fetches ALL completed jobs (Performance)
**File:** `Dashboard.tsx`, lines 264-285

This query loads **every completed job** to count them client-side. For active users, this could be hundreds/thousands of rows.

**Fix:** Add a `.limit(500)` as a safety cap, or ideally create a server-side aggregation. For now, adding a limit is the minimal fix.

#### 4. Missing `staleTime` on several queries
**File:** `Dashboard.tsx`

Queries at lines 101 (profile), 131 (brand count), 144 (freestyle count), 158 (recent jobs) have no `staleTime`, causing unnecessary refetches on component remount.

**Fix:** Add `staleTime: 5 * 60 * 1000` to these queries for consistency.

#### 5. `localStorage` accessed during render (Minor)
**File:** `Dashboard.tsx`, lines 326-327

`localStorage.getItem` is called during render, not inside a `useState` initializer or `useEffect`. This works but is technically a side-effect during render.

**Fix:** Move to a `useMemo` or `useState` initializer — low priority.

#### 6. Workflow sorting hardcoded in two places (DRY violation)
**File:** `Dashboard.tsx`, lines 460-468

The workflow display order is hardcoded inline. This same ordering likely appears elsewhere.

**Fix:** Extract to a shared constant — low priority.

#### 7. `FeedbackBanner` has `mb-20` margin bottom (Spacing bug)
**File:** `FeedbackBanner.tsx`, line 67

`mb-20` (5rem) adds excessive bottom margin. On the new-user dashboard it's between Discover and RecentCreations sections, creating a large gap.

**Fix:** Remove `mb-20` from the component and let the parent control spacing.

#### 8. `EmptyStateCard` has conflicting CSS classes
**File:** `EmptyStateCard.tsx`, line 81

`className="flex gap-2 -space-x-3"` — `gap-2` and `-space-x-3` fight each other for horizontal spacing in the collage. The `-space-x-3` wins visually but it's confusing.

**Fix:** Remove `gap-2` from the collage container.

---

### What's Already Good (No Changes Needed)
- **Lazy loading**: StudioChat and GlobalGenerationBar are lazy-loaded in AppShell
- **Route prefetching**: Hover-triggered prefetch on sidebar nav items
- **Image optimization**: Consistent use of `getOptimizedUrl` with quality parameters
- **Signed URLs**: Properly batched via `toSignedUrls`
- **Error recovery**: Critical error state with retry UI
- **Mobile UX**: Proper touch targets (min-h-[44px]), responsive grids, mobile-specific overlays
- **Skeleton states**: All loading states have proper skeleton placeholders

---

### Summary of Changes

| # | File | Change | Impact |
|---|------|--------|--------|
| 1 | `Dashboard.tsx` | Remove unused `creditUsageProgress` | Dead code cleanup |
| 2 | `Dashboard.tsx` | Add `.limit(500)` to `topWorkflow` query | Prevent unbounded data fetch |
| 3 | `Dashboard.tsx` | Add `staleTime` to 4 queries missing it | Reduce unnecessary refetches |
| 4 | `FeedbackBanner.tsx` | Remove `mb-20` | Fix excessive spacing |
| 5 | `EmptyStateCard.tsx` | Remove conflicting `gap-2` on collage | Fix CSS conflict |

All fixes are small, safe, and non-breaking.

