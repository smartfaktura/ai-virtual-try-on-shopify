# Fix: completed videos still show as "In Progress" until manual refresh

## Root cause (confirmed)
- DB rows for the 3 videos in your screenshot flipped to `status='complete'` at 14:45:39–14:45:45 UTC.
- Browser kept showing them as "Processing" because the only auto-refresh mechanism is a 4 s `setInterval` in `useGenerateVideo.ts`. Browsers (and the Lovable preview iframe) throttle background `setInterval` to once per minute or pause it entirely, so updates can be missed for minutes.
- `generated_videos` is **not** part of the `supabase_realtime` publication — verified via `pg_publication_tables`. So no push update reaches the client when a row flips.

## Fix scope
Backend = a one-line publication change. Frontend = wire a realtime channel + lightweight UX clarity. No changes to Kling polling, cron, or credits.

## Changes

### 1. Migration — enable realtime on `generated_videos`
```sql
ALTER TABLE public.generated_videos REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.generated_videos;
```

### 2. `src/hooks/useGenerateVideo.ts` — Realtime subscription
- Add a `useEffect` that opens a Supabase channel on `postgres_changes` for `public.generated_videos` filtered by the current user's `user_id`.
- On any `UPDATE` payload where `new.status` is `complete` or `failed`, immediately call `silentRefreshHistory()` and `refreshBalance()`.
- On `INSERT`, call `silentRefreshHistory()` so newly enqueued rows appear instantly.
- Cleanup channel on unmount.
- Keep the existing 4 s interval as a safety net but bump it to 8 s (less churn now that realtime is primary).
- Also add a `document.visibilitychange` listener: when tab becomes visible again, fire `silentRefreshHistory()` once (covers iframe edge cases).

### 3. `src/pages/VideoHub.tsx` — UX clarity (small)
- Per-card live timer on the In Progress strip ("Processing · 2m 14s"), so users see it's actually working and can tell when something is genuinely stuck (>10 min).
- Subtle bottom progress bar on each processing card (elapsed / ~7 min cap, frozen at 95%).
- Tag the thumbnail with a tiny "Source frame" pill so users don't confuse it with the finished video that uses the same input image.
- When a card transitions processing → complete during the session, briefly highlight the new card in the Completed grid (1.5 s soft ring).

## Verification
1. Apply migration, deploy frontend.
2. Open `/app/video` in two tabs.
3. Kick off one generation in tab A. Switch to tab B.
4. When Kling completes, both tabs should flip the card from "In Progress" to "Completed" within ~1 second of the row updating, with no manual refresh and no tab focus needed.
5. Confirm `pg_publication_tables` now lists `generated_videos`.

## Out of scope
- No changes to `poll-stuck-videos` cron, Kling polling, queue dispatcher, or credit refund logic.
- No redesign of the Video page layout or workflow cards.
