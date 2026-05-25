## Root cause

`generated-videos` is a **private** bucket. The bulk-download path in `VideoHub.tsx:266` correctly signs URLs via `toSignedUrl()`. The single-video Detail Modal does not — it uses the raw public URL in two places, both of which silently fail against a private bucket:

- `src/components/app/video/VideoDetailModal.tsx:124` — `fetch(video.video_url)` in `handleDownload` → 400 → corrupt blob saved → user perceives the video as "disappeared"
- `src/components/app/video/VideoDetailModal.tsx:179` — `<video src={video.video_url!}>` → broken player

Not an admin/RLS issue. Storage policy is correct (`auth.uid() = first folder of path`). Admin works only because they happen to use bulk download.

## Fix

### `src/components/app/video/VideoDetailModal.tsx`

1. Import the signing helper:
   ```ts
   import { toSignedUrl } from '@/lib/signedUrl';
   ```

2. Add a small effect that resolves a signed URL whenever the modal opens with a complete video:
   ```ts
   const [signedSrc, setSignedSrc] = useState<string | null>(null);
   useEffect(() => {
     let cancelled = false;
     setSignedSrc(null);
     if (open && video.video_url) {
       toSignedUrl(video.video_url)
         .then((url) => { if (!cancelled) setSignedSrc(url); })
         .catch(() => { if (!cancelled) setSignedSrc(null); });
     }
     return () => { cancelled = true; };
   }, [open, video.video_url]);
   ```

3. Use `signedSrc` for the in-modal `<video>` (line 179). While it's resolving, show the existing loader/poster so we don't render a broken `<video>`.

4. In `handleDownload` (line 120), replace the raw fetch with a signed one:
   ```ts
   const signed = await toSignedUrl(video.video_url);
   const res = await fetch(signed);
   if (!res.ok) throw new Error(`download ${res.status}`);
   ```
   Rest of the blob → anchor → click flow stays the same. The existing toast on failure remains the user-visible safety net.

### Audit

Confirmed by `rg "video_url" src/components/app/video src/pages` — only the two modal lines above and `ShortFilm.tsx:123` (which uses a local `completedClips[0].url`, not from a private bucket). No other consumer to fix.

## Out of scope (separate follow-up)

Investigation surfaced one more issue worth a later patch — flagging only:
- `video_projects.status` is never flipped to `'complete'` after Kling finishes. All of syncoo's projects are still `'processing'` 24h+ later. Video Hub queries `generated_videos` directly so cards still appear, but the parent table is silently rotten. Fix would be a small update inside `supabase/functions/generate-video/index.ts` next to where `generated_videos.status = 'complete'` is set.

Not touching this in the current patch — the user reported download specifically, and conflating the two fixes risks the queue/credit logic.

## Files changed

- `src/components/app/video/VideoDetailModal.tsx`

Two changes, one file. No DB migration, no edge-function change, no storage policy change.

## Reassuring the user (info@tsimkus / syncoo)

syncoo's 5 videos are all intact in storage and have valid storage paths (4.8–19 MB each, `status='complete'`). After this fix ships they can open any card and download successfully. No data was lost.
