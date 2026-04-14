

# Fix: Short Film Video Not Showing (Black Screen)

## Root Cause

The `generated-videos` storage bucket is **private**. The short film flow stores raw public URLs (e.g., `https://.../storage/v1/object/public/generated-videos/...`) in `result_url`, but these return 403 because the bucket requires signed URLs. The `<video>` tag tries to load the unsigned URL and gets nothing — hence the black screen.

The regular video hub works fine because `useGenerateVideo` calls `toSignedUrl()` on every video URL. The short film flow skips this step in two places:

1. **After generation completes** (line ~835): `pollQueueJobCompletion` returns an unsigned URL, stored directly in `shotStatuses`
2. **On draft restore** (line ~186): `result_url` loaded from `video_shots` table is used as-is

## Fix

### `useShortFilmProject.ts` — Sign video URLs

**After generation** (~line 831-836): Sign the `resultUrl` before storing it in state:
```typescript
const signedResultUrl = await toSignedUrl(resultUrl);
setShotStatuses(prev => prev.map(s => ({
  ...s, status: 'complete', result_url: signedResultUrl,
})));
```

**On draft restore** (~line 183-188): Sign each `result_url` when restoring shot statuses:
```typescript
const restoredStatuses = await Promise.all(shotRows.map(async (r) => ({
  shot_index: r.shot_index,
  status: r.status === 'complete' ? 'complete' : r.status === 'failed' ? 'failed' : 'pending',
  result_url: r.result_url ? await toSignedUrl(r.result_url) : undefined,
})));
```

**On retry** (~line 357-362): Same fix — sign `resultUrl` before storing.

### Files to Change

| File | Change |
|------|--------|
| `src/hooks/useShortFilmProject.ts` | Sign `result_url` with `toSignedUrl()` in 3 places: generation complete, draft restore, and retry |

No other files need changes — the `<video>` tag and `completedClips` derivation are fine; they just need valid signed URLs.

