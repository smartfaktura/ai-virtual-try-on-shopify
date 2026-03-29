

# Fix: Remove Public SELECT Policy on `generated-videos` Storage

## Problem

The `generated-videos` bucket is private, but the `"Anyone can view generated videos"` SELECT policy grants public read access with no ownership check. Any person with a valid file URL can access any user's video.

## Analysis

- A proper ownership policy already exists: `"Users can view own generated videos"` checks `auth.uid() = foldername(name)[1]`
- Videos are stored as `{user_id}/{task_id}.mp4`, matching the ownership pattern
- The client already uses signed URLs via `src/lib/signedUrl.ts` for all `generated-videos` URLs — no code changes needed
- The edge function's `getPublicUrl()` call just constructs a URL string used as a database field; the actual access goes through signed URLs on the client

## Change (1 item)

### Database migration

```sql
DROP POLICY "Anyone can view generated videos" ON storage.objects;
```

No client or edge function code changes required. The signed URL infrastructure already handles private bucket access correctly.

| # | Action | Detail |
|---|---|---|
| 1 | Database migration | Drop `"Anyone can view generated videos"` policy on `storage.objects` |

