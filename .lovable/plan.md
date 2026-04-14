

# Fix Short Film Audio Pipeline — Auto-Generate After Recovery

## Problems Found

1. **Audio generation is client-session-dependent**: `generateAudio()` at line 1074 only runs if `pollQueueJobCompletion` finishes in the same browser session. Any page reload, navigation, or browser close kills the audio step entirely.

2. **Recovery doesn't auto-trigger audio**: When resuming a draft, if the video is complete but audio is missing, `audioPhase` is set to `'idle'` — but the user must manually click "Generate Audio". This is confusing because the user expects audio to be part of the generation.

3. **No auto-resume after reload**: If the user reloads `/app/video/short-film`, there's no mechanism to detect they had an active project and auto-resume it. They must manually find and click "Resume Draft".

4. **ElevenLabs music function was never called**: Edge function logs confirm `elevenlabs-music` has zero invocations for the last generation, confirming the audio step was skipped entirely.

## Changes

### File: `src/hooks/useShortFilmProject.ts`
**Auto-trigger audio after recovery** — When `loadDraft` detects a completed project with missing audio (`audioPhase` set to `'idle'`), automatically call `generateAudio()` instead of just showing the button. Add a `useEffect` that watches for `audioPhase === 'idle'` + completed shots + no active generation, and auto-fires audio generation.

### File: `src/pages/video/ShortFilm.tsx`
**Auto-resume last active project on mount** — Add a `useEffect` that checks for the most recent `video_projects` row with `status = 'processing'` or `status = 'complete'` (with missing audio) on component mount. If found, auto-call `loadDraft(projectId)` so the user doesn't have to manually find and resume their project.

### File: `src/hooks/useShortFilmProject.ts`  
**Persist generation state to sessionStorage** — Before starting generation, save the `projectId` to `sessionStorage`. On hook init, check if there's a saved projectId and auto-load it. This survives page reloads within the same tab.

## Technical Details

### Auto-audio trigger (useShortFilmProject.ts)
```
// After loadDraft sets audioPhase to 'idle' with completed shots,
// add useEffect to auto-trigger:
useEffect(() => {
  if (audioPhase === 'idle' && projectId && !isGeneratingAudio && !isGenerating) {
    const hasCompleteShots = shotStatuses.some(s => s.status === 'complete');
    const layers = getEffectiveLayers(settings);
    const anyAudioOn = layers.music || layers.sfx || layers.voiceover;
    if (hasCompleteShots && anyAudioOn && !audioAssets?.backgroundTrackUrl) {
      generateAudio(projectId, shots);
    }
  }
}, [audioPhase, projectId, shotStatuses]);
```

### Session persistence (useShortFilmProject.ts)
- Save `projectId` to `sessionStorage` key `'sf_active_project'` when generation starts
- On hook init, read from `sessionStorage` and call `loadDraft()` if found
- Clear on `resetProject()`

### Auto-resume (ShortFilm.tsx)
- On mount, check `sessionStorage` for active project
- If found, trigger `loadDraft` automatically — this chains into recovery + auto-audio

## Summary

| File | Change |
|------|--------|
| `useShortFilmProject.ts` | Auto-trigger audio after recovery; persist projectId to sessionStorage; auto-load on init |
| `ShortFilm.tsx` | Auto-resume from sessionStorage on mount |

