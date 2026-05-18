# Add audio download to preview modal (talking videos)

## What changes

In `src/components/app/video/VideoDetailModal.tsx`:

1. Detect talking videos by checking `video.metadata?.audio_storage_path` (and/or `video.metadata?.kind === 'talking_video'`).
2. Keep the existing **Download Video** button as the primary action.
3. Add a secondary **Download Audio (MP3)** button directly under it, shown only when an audio path exists and the video is complete.
4. New handler `handleDownloadAudio`:
   - Calls `supabase.storage.from('generated-audio').createSignedUrl(path, 3600)`.
   - Fetches the signed URL, downloads as blob, triggers `<a download>` with filename `{projectTitle||'voiceover'}-{videoId}.mp3`.
   - Toast on success/failure, separate `downloadingAudio` loading state so it doesn't block the video download spinner.
5. Update the `GeneratedVideo` type usage (already includes `metadata`) — no schema change needed. The `generated-audio` bucket is private; signed URLs work because the row's RLS already grants the owner read access on the path (paths are user-scoped: `{user_id}/talking-video/...`).

No backend / edge function changes are needed for the download itself.

## Files touched

- `src/components/app/video/VideoDetailModal.tsx` — UI + handler (single file edit).

## Out of scope

- No changes to `VideoResultsPanel` row-level menus (modal-only as the user requested).
- No changes to silent/regular videos (button is conditional).

---

# How to make lip-sync even better

These are tuning options — I'll only apply the ones you pick.

1. **Cleaner base clip (highest impact)**
   - Already added "lips closed" instruction + negative-prompt "talking, mouthing words". Can go further: force `camera_fixed: true` on talking videos so the head stays stable — Kling lip-sync hates jitter and parallax.
   - Crop/zoom guidance in the base prompt: "MCU framing, head fills upper third, no hand-near-mouth, no hair across lips".

2. **Audio prep**
   - ElevenLabs: set `stability` ~0.5, `similarity_boost` ~0.85, `style` 0–0.2 for talking heads. Lower `style` = less mumbling = sharper phonemes for Kling to align.
   - Trim leading/trailing silence on the MP3 before upload (Kling treats silence as mouth-open frames). Easy to add in `generate-talking-video` with a tiny WAV/MP3 trim using the existing duration measurement.
   - Light compression / loudness normalize to -16 LUFS so quiet phonemes register.

3. **Duration matching**
   - Already padding 0.3s. Better: pick base duration = `ceil(audio_duration + 0.4)` capped at 10s, and pass `audio_duration_sec` AND `voice_language` (already added) so Kling can crossfade the tail to closed mouth.

4. **Per-language phoneme model**
   - Already wired `voice_language`. Add explicit override in UI for EN vs ZH (Kling has best results when language matches the spoken language, not the script language).

5. **Reference image quality**
   - Strongly recommend front-facing, lips-closed, evenly lit, no sunglasses-over-mouth, no occlusion. Add a preflight warning if the source image fails a simple face-detect / mouth-visibility check (would need a small client check or Gemini vision call).

6. **Fallback retry**
   - If Kling lip-sync returns low confidence (it sometimes reports it), auto-retry once with `camera_fixed=true` before delivering.

Tell me which of these you want and I'll implement together with the audio-download button.
