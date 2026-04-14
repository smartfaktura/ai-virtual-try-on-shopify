

# Fix Short Film Audio & Results Page

## Build Errors

The `buildContextualSfxPrompt` and `fitTextToDuration` functions are syntactically broken — they got inserted **inside** the body of `buildContextualMusicPrompt` (between lines 1063-1123), making them nested/invisible to the hook. The `buildContextualMusicPrompt` function itself is split in two halves (lines 1050-1062 and 1124-1127).

**Fix**: Restructure lines 1048-1127 so all three functions are properly independent top-level functions with correct closing braces.

## Results Page UX Issues

1. **Duplicate videos**: "Preview Film" (with audio player) AND "Your Short Film" (plain `<video controls>` without audio) both show — redundant and confusing.
2. **"Your Short Film" has no audio**: It's a raw `<video>` tag at line 312 with no audio mixing.
3. **Download has no audio**: `downloadAllClips` just fetches the raw video URL — no audio tracks merged.
4. **Preview Film lacks native controls**: Only a play/pause button, no scrubber/progress bar.

## Implementation Plan

### 1. Fix broken function nesting (useShortFilmProject.ts)
- Close `buildContextualMusicPrompt` properly before `buildContextualSfxPrompt`
- Make all three helper functions independent top-level functions
- This fixes the TS2552/TS2304 build errors

### 2. Remove duplicate "Your Short Film" section (ShortFilm.tsx)
- Remove lines 302-341 (the second video + shot breakdown)
- Move the shot breakdown metadata into the Preview Film section below the player
- Keep only ONE video display: the `ShortFilmVideoPlayer` with full audio mixing

### 3. Add video controls to ShortFilmVideoPlayer
- Add a progress/scrubber bar using the video's `currentTime` and `duration`
- Add current time / total time display
- Keep the existing play/pause + mixer

### 4. Move download to use the Preview Film section
- Single download button next to "Preview Film" header
- Download still fetches the raw video (audio merging would require server-side FFmpeg, which is out of scope — but note this limitation)

## Files to Change

| File | Change |
|------|--------|
| `src/hooks/useShortFilmProject.ts` | Fix function nesting — close `buildContextualMusicPrompt` before the other two functions |
| `src/pages/video/ShortFilm.tsx` | Remove duplicate "Your Short Film" section, consolidate into single player with download + shot breakdown |
| `src/components/app/video/short-film/ShortFilmVideoPlayer.tsx` | Add progress bar / scrubber and time display |

