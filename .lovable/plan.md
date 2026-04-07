
Goal: make `/app/admin/trend-watch` show the newest synced posts immediately, and reliably fetch up to 12 latest non-video posts per account.

What I found
- The page reads posts from `useAllWatchPosts()` with query key `['watch-posts-all', ...]`.
- Sync currently invalidates `['watch-posts']`, not `['watch-posts-all']`, so the grid does not refetch after a sync.
- There is no realtime subscription for `watch_accounts` / `watch_posts`, and those tables are not in realtime publication, so sync status and new posts do not appear live.
- The latest synced account still has only 8 rows in `watch_posts`, which means the edge function pagination is still not actually collecting more image posts before insert.
- Existing access control is already correct for this feature: `watch_accounts` and `watch_posts` are admin-only. No RLS policy changes are needed.

Implementation plan

1. Fix immediate client refresh after sync
- Update `src/hooks/useWatchAccounts.ts` so `syncAccount.onSuccess` invalidates:
  - `['watch-accounts']`
  - `['watch-posts-all']`
  - `['watch-posts', id]`
- Also normalize the grouped-posts query key so it does not rely on mutating `accountIds.sort()` inline.

2. Add live page updates
- Add a realtime subscription (same pattern already used in `useDiscoverPresets`) for:
  - `public.watch_accounts`
  - `public.watch_posts`
- On any insert/update/delete, invalidate the Trend Watch queries so the page updates without a manual reload.
- Add a migration to enable realtime publication for both tables:
  - `ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_accounts;`
  - `ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_posts;`

3. Harden the Instagram sync function so it really reaches 12 image posts
- Update `supabase/functions/fetch-instagram-feed/index.ts` to:
  - keep paginating until it collects 12 unique non-video posts or truly runs out of pages
  - dedupe posts across pages by `instagram_post_id` / shortcode
  - treat repeated/empty cursors as a stop condition
  - skip any video/reel/carousel item that does not provide a usable image
  - only insert rows with a valid image URL
- Make cursor handling more defensive by supporting the actual response shape from this API, not just one `end_cursor` path.
- Return sync metadata such as:
  - `posts_count`
  - `pages_fetched`
  - `videos_skipped`
  - `exhausted_feed`
so the UI can explain when fewer than 12 images were genuinely available.

4. Surface better sync feedback in the UI
- Use the function response in `useWatchAccounts.ts` to show a clearer toast, for example:
  - “Synced 12 image posts”
  - or “Synced 8 image posts — newer items were videos / no more image posts available”
- This prevents “it’s broken” when the source feed itself is the limit.

Files to update
- `src/hooks/useWatchAccounts.ts`
- `supabase/functions/fetch-instagram-feed/index.ts`
- likely a small new subscription hook or subscription logic inside `useWatchAccounts.ts`
- one new migration for realtime publication
- `src/pages/AdminTrendWatch.tsx` only if small wiring is needed for improved toast/state display

Validation
- Sync one account with mixed photo/video content and confirm:
  - the page updates without reload
  - sync badge/time changes live
  - the grid refetches immediately
  - 12 latest image posts appear when available
  - if fewer than 12 exist after paging, the UI says why instead of silently showing 8
