

# Fix: Lip-Sync Breaks Video + Audio Playback

## Problems Found

### Problem 1: Lip-sync replaces the ENTIRE video with a single-shot clip
Line 1122: `setShotStatuses(prev => prev.map(s => ({ ...s, result_url: signedLipSync })))` — this replaces ALL shot result URLs with the lip-synced video URL. The lip-sync API takes the full multishot video and re-renders it with one shot's voiceover baked in. This means:
- The returned video has audio baked in (the VO for that one shot)
- The player also plays the ElevenLabs VO/SFX/music on top → double audio = "mashed up" sound

### Problem 2: Lip-sync sends a signed/private URL to Kling
Line 1098: `videoUrl` comes from `shotStatuses[].result_url` which is a signed Supabase URL. Kling's lip-sync API needs a publicly accessible URL to fetch the video. A signed URL may work briefly but expires, and Kling may not be able to fetch it.

### Problem 3: Lip-sync sends per-shot VO URL that may also be private
Line 1108: `voAsset.url` is from the `generated-audio` bucket (private). Same access issue.

### Problem 4: Multishot video can't be lip-synced per-shot
Kling lip-sync takes an entire video + an audio file and syncs lips across the whole video. You can't apply it to just one shot within a combined multishot video. The entire approach is fundamentally mismatched with the multishot pipeline.

## Fix

### File: `src/hooks/useShortFilmProject.ts`
**Disable lip-sync for multishot videos entirely.** The multishot pipeline produces a single combined video — Kling lip-sync can't selectively sync one shot's lips within it. The VO is already played as a separate audio layer with frame-accurate timing, which sounds good. Lip-sync should only apply to single-shot videos where the entire video is one character talking.

Change: Wrap the lip-sync block (lines 1090-1139) with a guard that only runs for single-shot projects (`shots.length === 1`). For multishot (which is the normal short film flow), skip lip-sync entirely — the VO layer already handles narration.

This single change fixes:
- The "mashed up" audio (no more double VO from lip-sync + ElevenLabs)
- The video replacement bug (lip-synced URL overwriting all shots)
- The private URL access issue (lip-sync won't be called)

