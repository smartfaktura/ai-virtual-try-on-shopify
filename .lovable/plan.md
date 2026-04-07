

# Make "Refresh All" Smart — Skip Recently-Synced Accounts

## Problem
"Refresh All" calls the Instagram API for every active account regardless of when it was last synced. Each account costs 2-5 RapidAPI requests. This wastes quota when accounts were synced minutes ago.

## Solution
Add a staleness check so "Refresh All" only syncs accounts that haven't been synced in the last N hours (default: 6 hours). Individual sync buttons remain unchanged (always force-sync).

## Changes

### 1. Update `handleRefreshAll` in `AdminTrendWatch.tsx`
- Before calling `syncAccount` for each account, check `last_synced_at`
- Skip accounts where `last_synced_at` is less than 6 hours old
- Show a toast summary: "Refreshed 3 accounts, skipped 5 (recently synced)"
- Accounts with `sync_status: 'failed'` or no `last_synced_at` are always included

### 2. Update the edge function `fetch-instagram-feed/index.ts`
- Fix the broken CORS import (same issue as the other functions — uses the non-existent esm.sh path)
- Replace with inline `corsHeaders` constant

### 3. Minor UX: tooltip on "Refresh All" button
- Add a title/tooltip: "Syncs accounts not refreshed in the last 6 hours"

## Files to modify
- `src/pages/AdminTrendWatch.tsx` — smart refresh logic with staleness filter
- `supabase/functions/fetch-instagram-feed/index.ts` — fix CORS import

