

## Auto-Expire Failed Activity Notifications

The Workflows page already filters failed jobs to the last 24 hours, but they persist within that window until manually dismissed. The fix will auto-dismiss failed notifications that are older than a configurable threshold and also persist dismissals in localStorage with timestamps.

### Changes

**`src/pages/Workflows.tsx`**
- Add a time-based auto-dismiss: filter out failed jobs older than 1 hour (or a short window like 2 hours) from the displayed list, so they naturally fade away without manual dismissal
- Alternatively, reduce the failed jobs query window from 24h to something shorter (e.g., 2-4 hours) so stale failures stop appearing sooner
- Auto-add failed group keys to the `dismissedKeys` set in localStorage when they exceed the age threshold, preventing them from reappearing

### Approach

1. Reduce the `recentlyFailedJobs` query window from `24 * 60 * 60 * 1000` (24h) to `4 * 60 * 60 * 1000` (4 hours) — failed jobs older than 4 hours auto-expire from the query
2. Add a client-side filter that also hides failed jobs older than 2 hours from the UI, giving a shorter visible window while the query catches recent failures
3. Keep the dismiss (X) button for immediate manual dismissal

This means failed notifications show for up to ~2-4 hours, then silently disappear — no manual action needed.

