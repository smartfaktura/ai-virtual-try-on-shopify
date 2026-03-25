

# Fix: Audio Not Generating — Wrong Kling API Parameter

## Root Cause

The Kling API's image-to-video endpoint uses `sound: "on"` / `sound: "off"` for audio control. Our edge function sends `with_audio: true`, which Kling silently ignores — no error, just no audio.

## Fix

### 1. Update `supabase/functions/generate-video/index.ts`

Replace line 182:
```
if (body.with_audio) klingBody.with_audio = true;
```
With:
```
klingBody.sound = body.with_audio ? "on" : "off";
```

This always sends the `sound` parameter explicitly (defaulting to "off" when not requested).

### 2. Add logging for audio parameter

Update the console.log on line 162 to include audio status so we can verify in logs:
```
console.log(`[generate-video] Creating task ... audio=${body.with_audio ? 'on' : 'off'}`);
```

### 3. Also fix: forwardRef console warnings

The console shows `forwardRef` warnings for `CreditEstimateBox` and `VideoResultsPanel`. Wrap both with `React.forwardRef()`.

**Files:**
- `supabase/functions/generate-video/index.ts` — fix `sound` parameter
- `src/components/app/video/CreditEstimateBox.tsx` — add forwardRef
- `src/components/app/video/VideoResultsPanel.tsx` — add forwardRef

