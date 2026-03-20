

# Fix "Images Generated" Slow Loading on Dashboard

## Problem
The "Images Generated" metric fetches ALL completed `generation_jobs` rows (140+) to sum `requested_count` client-side. This makes two sequential DB calls every time the dashboard loads, with no caching beyond the global 2-minute staleTime. The skeleton shows every visit.

## Solution

### 1. Add aggressive caching + placeholderData
**File:** `src/pages/Dashboard.tsx` (lines 193-219)

Add `staleTime: 5 * 60 * 1000` (5 minutes) and `placeholderData: keepPreviousData` to the query. This means:
- First load still fetches, but subsequent navigations show the cached number instantly (no skeleton)
- Background refetch happens silently

### 2. Run both sub-queries in parallel (already done) but reduce payload
The `generation_jobs` query already selects only `requested_count`, which is fine. No change needed there.

### 3. Same caching treatment for other metric queries
Apply `staleTime: 5 * 60 * 1000` to the product count, schedule count, and freestyle count queries too, so all 4 metric cards load instantly on return visits.

This is the lightest fix -- no migration needed, no RPC. The metric will show cached data immediately and refresh in the background.

