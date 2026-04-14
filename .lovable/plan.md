

# Fix Short Film Audio Generation — Complete Debug & Solution

## Root Causes

After thorough investigation, the three ElevenLabs edge functions (`elevenlabs-music`, `elevenlabs-sfx`, `elevenlabs-tts`) have **zero logs** — they have literally never been called, even though the functions are deployed and the API key is configured.

The `generateAudio()` function code itself is correct. The problem is that **it never executes**:

1. **Audio call is fragile in the generation flow**: The `await generateAudio()` at line 920 sits inside a try block (lines 715-928). If the DB update at line 906 (`video_projects.update()`) throws any error (network, type mismatch), the outer catch at line 923 skips audio entirely — with no specific error logging for this scenario.

2. **No auto-trigger on draft restore**: When a completed project is restored via `loadDraft`, audio phase is set to `'idle'` but audio does NOT auto-generate. Users must manually find and click the "Generate Audio" button.

3. **15-minute gap**: Audio only triggers after the 15-minute video poll completes. If the user closes the tab during polling (common behavior), audio never runs, and the next visit only shows the idle button.

4. **Old drafts have `audioMode: 'silent'`**: Projects created before the recent default change still carry `'silent'` in their persisted `settings_json`, making the button condition fail.

## Implementation Plan

### 1. Move audio generation outside the fragile try block
**File: `src/hooks/useShortFilmProject.ts`**
- Move `generateAudio()` call out of the inner try-catch (line 851-898) so a DB update failure doesn't prevent audio
- Add explicit `console.log` before the audio call for debugging
- Wrap audio call in its own try-catch with specific error logging

### 2. Auto-generate audio on draft restore when missing
**File: `src/hooks/useShortFilmProject.ts`**  
- In `loadDraft`, after detecting `audioPhase === 'idle'` (audio expected but missing) AND all shots are complete, automatically call `generateAudio()` instead of just showing the button
- This ensures users who return to a completed project get their audio without manual intervention

### 3. Add diagnostic logging to `generateAudio`
**File: `src/hooks/useShortFilmProject.ts`**
- Add `console.log` at entry: mode, shot count, project ID
- Add `console.log` before each `fetch` call
- Add `console.log` on response status from each ElevenLabs call
- This will make future debugging possible via console logs

### 4. Force `audioMode` to `'full_mix'` when restoring old drafts with `'silent'`
**File: `src/hooks/useShortFilmProject.ts`**
- In `loadDraft`, if restored settings have `audioMode === 'silent'`, override to `'full_mix'`
- This fixes old projects that were created with the previous default

### 5. Deploy edge functions to ensure they're live
- Deploy `elevenlabs-music`, `elevenlabs-sfx`, `elevenlabs-tts` to confirm they're accessible

### Files to Change

| File | Change |
|------|--------|
| `src/hooks/useShortFilmProject.ts` | Move audio call, add auto-trigger on restore, add logging, fix old draft audioMode |

### Technical Detail

The critical code change in `startGeneration`:

```
// BEFORE (fragile — DB error kills audio):
try {
  ...video polling...
  await supabase.from('video_projects').update(...)  // if this throws...
  await generateAudio(...)  // ...this never runs
} catch (err) { ... }

// AFTER (resilient):  
try {
  ...video polling...
} catch { ... }

// Audio runs independently
try {
  await supabase.from('video_projects').update(...)
} catch { console.error(...) }

if (settings.audioMode !== 'silent' && settings.audioMode !== 'ambient') {
  try {
    await generateAudio(currentProjectId, shots);
  } catch (audioErr) {
    console.error('[ShortFilm] Audio generation failed independently:', audioErr);
  }
}
```
