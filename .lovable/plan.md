

# "Load More" Older Posts for Watch Accounts

## Problem
Currently the sync function deletes all posts and re-fetches the latest 12. There's no way to go deeper into an account's history. The API uses cursor-based pagination, so we can reuse the last cursor to fetch the next page without re-fetching posts we already have.

## Approach
Store the pagination cursor from the last sync on `watch_accounts`, then add a "Load More" mode to the edge function that appends older posts instead of replacing.

## Changes

### 1. Migration: add `last_sync_cursor` column to `watch_accounts`
- `ALTER TABLE watch_accounts ADD COLUMN last_sync_cursor text DEFAULT '';`

### 2. Update `fetch-instagram-feed/index.ts`
- Accept optional `load_more: true` in the request body
- When `load_more` is true:
  - Read the `last_sync_cursor` from the account row
  - If empty, return `{ error: "No cursor available — sync first" }`
  - Start pagination from that cursor instead of the beginning
  - **Do NOT delete** existing posts — only insert new ones (use `ON CONFLICT` on `instagram_post_id` to skip duplicates, or filter in code)
  - Skip the profile image fetch (saves 1 API call)
- In both modes, save the final cursor to `watch_accounts.last_sync_cursor` after fetching
- Return `{ posts_count, has_more }` so the UI knows whether to show the button

### 3. Add unique constraint on `watch_posts(watch_account_id, instagram_post_id)`
- To safely upsert: `ALTER TABLE watch_posts ADD CONSTRAINT watch_posts_account_post_unique UNIQUE (watch_account_id, instagram_post_id);`
- Use `.upsert(..., { onConflict: 'watch_account_id,instagram_post_id', ignoreDuplicates: true })` in the edge function

### 4. Update `useWatchAccounts.ts` — add `loadMorePosts` mutation
- New mutation calling `fetch-instagram-feed` with `{ username, account_id, load_more: true }`
- Returns post count and `has_more` flag

### 5. Update `WatchAccountCard.tsx` — "Load More" button
- Show a "Load More" button when account has exactly 12 posts (the initial batch)
- Button calls `loadMorePosts` mutation
- While loading, show spinner on the button
- After success, toast shows count of new posts added

### 6. Update `useAllWatchPosts` — raise the limit
- Currently caps at 12 posts per account in the grouped query; raise to 50 so loaded-more posts actually appear

## Files to modify/create
- **Migration**: add `last_sync_cursor` column + unique constraint
- `supabase/functions/fetch-instagram-feed/index.ts` — load_more mode
- `src/hooks/useWatchAccounts.ts` — `loadMorePosts` mutation, raise post limit
- `src/components/app/trend-watch/WatchAccountCard.tsx` — "Load More" button

