

# Fix: Music Audio Not Added to Short Film

## Root Cause

Two bugs prevent audio from being generated and played:

### Bug 1: `generateAudio()` called without project ID (line 873)
After video generation succeeds, the code calls `await generateAudio()` without passing `currentProjectId`. The `generateAudio` function falls back to `projectId` from React state — but `setProjectId(currentProjectId)` was called in the same render cycle, so `projectId` is still `null`. This causes the audio generation to either fail silently or not persist correctly.

**Fix**: Change `await generateAudio()` → `await generateAudio(currentProjectId)` on line 873.

### Bug 2: Preview Film button hidden (line 268)
The condition `completedClips.length > 1` blocks the `ShortFilmVideoPlayer` (which handles audio overlay/mixing) because after deduplication there's only 1 clip. The preview player with the audio mixer never shows.

**Fix**: Change `completedClips.length > 1` → `completedClips.length > 0` on line 268.

## Files to Change

| File | Line | Change |
|------|------|--------|
| `src/hooks/useShortFilmProject.ts` | 873 | `generateAudio()` → `generateAudio(currentProjectId)` |
| `src/pages/video/ShortFilm.tsx` | 268 | `completedClips.length > 1` → `completedClips.length > 0` |

