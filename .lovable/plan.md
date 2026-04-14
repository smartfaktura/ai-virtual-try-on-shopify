

# Fix Audio Defaults, ETA, and Unified Progress

## Issues
1. **Dialog/Speech preselected**: `DEFAULT_SETTINGS.audioLayers.voiceover` is `true` — should be `false`
2. **Wrong ETA**: Currently `totalDuration * 8` to `totalDuration * 15` which gives ~30s-60s for a short film. Real time is ~5 minutes. Fix to show ~4-6 min range.
3. **Fragmented progress**: User sees separate "Generating film" then "Generating background music" as independent steps. Should be one unified progress that only shows "Complete" when everything (video + music) is done.

## Changes

### 1. Fix default voiceover to OFF (`src/hooks/useShortFilmProject.ts`)
- Line 50: Change `voiceover: true` to `voiceover: false`
- Also fix backward-compat fallback on lines 199 and 322 where `voiceover: true` is hardcoded

### 2. Fix ETA in progress panel (`ShortFilmProgressPanel.tsx`)
- Change ETA formula to realistic values: ~240s (4min) to ~360s (6min) regardless of shot count, since Kling multishot processes as one job

### 3. Unified progress — hide "Complete" until everything is done (`ShortFilm.tsx`)
- Change `allDone` / `allSucceeded` logic to also account for music generation: if `settings.audioLayers.music` is ON, the film is not "done" until `audioPhase === 'done'` and `audioAssets?.backgroundTrackUrl` exists
- Remove the separate "Generating background music..." banner — fold it into the progress panel phases
- Update `ShortFilmProgressPanel` to accept an `audioPhase` prop and show music generation as part of the same flow (e.g., director message says "Adding background music..." after video completes)
- Single "Film Complete" state only when both video AND music (if enabled) are ready

### Files Modified

| File | Change |
|------|--------|
| `src/hooks/useShortFilmProject.ts` | Default `voiceover: false`, fix hardcoded fallbacks |
| `src/components/app/video/short-film/ShortFilmProgressPanel.tsx` | Fix ETA to ~4-6 min, add `audioPhase` prop for unified progress |
| `src/pages/video/ShortFilm.tsx` | Unify completion logic (video+music), remove separate music banner |

