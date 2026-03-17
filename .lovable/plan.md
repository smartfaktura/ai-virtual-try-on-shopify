

## Add Refresh Button + Today/Yesterday Filters to Admin Status

### Changes — `src/pages/AdminStatus.tsx`

**1. Add manual refresh button**
- Destructure `refetch` and `isFetching` from `useQuery`
- Add a `RefreshCw` icon button next to the time range toggle that calls `refetch()`
- Spin the icon while fetching

**2. Add "Today" and "Yesterday" time range options**
- Change `TimeRange` from a numeric-only type to include string literals: `'today' | 'yesterday' | 24 | 168 | 720`
- Compute hours dynamically before passing to the RPC:
  - "Today" = hours elapsed since midnight (local time), minimum 1
  - "Yesterday" = hours since yesterday midnight (covers ~24-48h window)
  - Numeric values pass through as-is
- Update `RANGE_LABELS` and the toggle button array to include these new options
- Default to `'today'` instead of `24`

**3. Layout**
- Place the refresh button inline after the time range pills
- Show a subtle "Last updated X ago" timestamp next to the refresh button

