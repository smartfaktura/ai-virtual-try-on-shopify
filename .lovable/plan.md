

# Short Film Audio Integration — Status Report & Remaining Fix

## Status: All Previously Identified Issues Are Resolved

| Issue | Status |
|-------|--------|
| CORS import broken in edge functions | Fixed — inline `corsHeaders` in all 3 functions |
| Edge function auth (`getClaims`) | Fixed — uses `getUser()` |
| Signed URL expiry (was 1 hour) | Fixed — now 7 days (604800s) |
| Audio not restored on draft resume | Fixed — `loadDraft` queries DB and restores `audioAssets` |
| Preview button state bug | Fixed — separate `isLoadingPreview` / `isPlayingPreview` |
| SFX only in `full_mix` mode | Fixed — SFX now generates in `music` mode too |

## One Remaining Gap: Signed URLs Expire After 7 Days

The DB stores pre-signed URLs (not raw storage paths). After 7 days, these URLs expire permanently — the audio is still in storage but the saved URLs are dead. The existing `signedUrl.ts` utility handles `generated-videos` and `generation-inputs` but **does not include `generated-audio`**.

### Fix

1. **Store raw public-style paths in DB** instead of signed URLs (e.g., the storage path `userId/music-track.mp3`)
2. **Add `generated-audio` to `PRIVATE_BUCKETS`** in `src/lib/signedUrl.ts` so the `toSignedUrl()` utility auto-signs them on load
3. **Update `loadDraft`** to run restored audio URLs through `toSignedUrl()` before setting state
4. **Update `uploadAudioToStorage`** to return the public-format URL (not a pre-signed one) for DB persistence

### Files to change

| File | Change |
|------|--------|
| `src/lib/signedUrl.ts` | Add `'generated-audio'` to `PRIVATE_BUCKETS` |
| `src/hooks/useShortFilmProject.ts` | Store raw public URL in DB; sign URLs on restore in `loadDraft` |

This is a small, focused fix — about 10 lines of code across 2 files. Everything else in the audio integration is working as intended.

