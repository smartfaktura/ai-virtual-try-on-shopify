

## Add Loading States to Dashboard Metric Cards

### Problem
The four metric cards (Images Generated, Credits Remaining, Products, Active Schedules) render immediately with default `0` values before data loads from the backend. This causes a visual "pop-in" where numbers jump from 0 to their real values, making the dashboard look broken momentarily.

### Solution
Extract `isLoading` from each `useQuery` call and pass it to the `MetricCard` `loading` prop. The MetricCard component already has built-in skeleton/shimmer loading states -- they just need to be wired up.

### Changes

**`src/pages/Dashboard.tsx`**
- Add `isLoading` destructuring to the four metric queries:
  - `generatedCount` query -> `isLoading: generatedLoading`
  - `productCount` query -> `isLoading: productsLoading`
  - `scheduleCount` query -> `isLoading: schedulesLoading`
  - Credits balance comes from `useCredits()` context -- no loading state needed since it initializes from context
- Pass `loading` prop to each MetricCard in the returning user dashboard metrics grid

The MetricCard already renders pulse-animated skeleton placeholders when `loading={true}`, so no changes needed to that component.

