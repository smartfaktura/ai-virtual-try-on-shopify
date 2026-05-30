## Goal
1. Stop the silent undercharge — backend deduction must match the credit number shown in the UI
2. Raise Animate 10 s base cost from 40 → **50** credits
3. Remove the Audio mode option from `/app/video/animate` and `/app/video/start-end` (always silent)

## Changes

### 1. `src/config/videoCreditPricing.ts` — single source of truth, bump 10s
- `animate.base10s`: `40` → **`50`**
- Keep `base5s: 25`, `premiumMotion: 2`
- Set `animate.ambient: 0` (no longer reachable, but safe)
- Set `startEnd.ambient: 0`

### 2. `supabase/functions/enqueue-generation/index.ts` — use the same formula
Replace the hardcoded `dur === "10" ? 18 : 10` block for `video` jobs with the same numbers used by the frontend:
```ts
// animate workflow
let cost = dur === "10" ? 50 : 25;
if (["product_orbit", "premium_handheld"].includes(motion)) cost += 2;
// audio removed — ignore audio field even if client sends it
return cost;
```
Keep the `startEnd` (flat 35) and `video_multishot` (40) branches as-is. Deploy this function.

### 3. Remove Audio UI — `src/pages/video/AnimateVideo.tsx`
- Drop `AudioModeSelector` import and its render block (line ~1277)
- Drop the per-image Audio `<select>` in bulk overrides (lines ~952–956)
- Hardcode `audioMode = 'silent'` (keep the constant so payloads/estimates stay valid) and remove the `useState`
- Remove "Audio" row from the summary list (line ~503)

### 4. Remove Audio UI — `src/pages/video/StartEndVideo.tsx`
- Drop `AudioModeSelector` import and the entire "Audio & Note" section header for audio (line ~358–367) — keep the Note input, just rename heading to "Note"
- Hardcode `audioMode = 'silent'`, remove `useState`
- Remove "Audio" entry from the summary chips (line ~227)

### 5. No DB migration needed
`credits_reserved` continues to store whatever `enqueue-generation` calculates — only the formula changes.

## What this fixes
- tsimkus's 5 s silent job will now deduct **25** credits (was 10), matching the button label
- A 10 s silent video will deduct **50** credits (was 18)
- 10 s + premium_handheld will deduct **52** credits (was 24)
- Users can no longer pick Ambient audio on these two workflows, so the +4 ambient surcharge disappears entirely from these flows

## Not changing
- Short Film pricing (already disabled in UI)
- Consistent Model / Ad Sequence workflows
- The `audio` field in `generated_videos.metadata` — old rows keep their value; new rows simply won't have audio enabled

## Files touched
- `src/config/videoCreditPricing.ts`
- `supabase/functions/enqueue-generation/index.ts` (deploy)
- `src/pages/video/AnimateVideo.tsx`
- `src/pages/video/StartEndVideo.tsx`
