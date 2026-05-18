## Why your prompt is ignored

Your prompt is ~1,250 characters describing walking, hand placement, orbit camera, multiple angles, full-body fashion campaign. None of it survives the Talking Video pipeline because **5 hard-coded rules in `generate-talking-video/index.ts` overrule it**:

1. **Action prompt is clamped to 240 chars** (`sanitizeActionPrompt`). Your prompt is silently truncated — Kling only sees the first sentence or two, not the orbit camera, not the strap touch, not the walking.
2. **SUBJECT line forces "medium close-up, head and shoulders visible"** in every prompt — this kills walking, full-body swimwear shots, and side angles by design.
3. **SAFETY line says "Hands stay completely out of frame"** at Still / Natural / Presenter levels. Touching the bikini strap is literally listed as a negative unless you pick Expressive or Cinematic.
4. **Camera move picker only shows at Cinematic**, and even then it's push-in / pull-out / arc ≤10°. Your "smooth orbit, left-to-right, front + 3/4 + side angles" can't be selected at all — and the negative prompt actively blocks `orbit, tracking shot, pan` unless you're on Cinematic.
5. **MOUTH lock is non-negotiable** ("Lips softly closed… do NOT animate speaking"). This is correct for lip-sync, but it also locks the head from turning past ~15°, so side angles and confident profile poses are filtered out.

In short: Talking Video is a **head-and-shoulders lip-sync tool**, not a campaign-video tool. Your prompt was 80% truncated and the surviving 20% got overridden by the framing/safety rules. The "old instructions" suspicion is correct — the SUBJECT, SAFETY and MOUTH blocks are the ones killing motion.

## What to change

Two-part fix. Keep lip-sync safe, but stop silently throwing away the user's intent.

### A. Stop discarding the prompt (edge function — `supabase/functions/generate-talking-video/index.ts`)

- Raise `sanitizeActionPrompt` cap from **240 → 600 chars** and raise the final prompt cap from 1800 → 2400.
- Raise the picker textarea cap (`MAX_ACTION_LEN`) to 600 and the client clamp in `useTalkingVideoProject.start()` to match.
- Move the `ACTION:` block **above** PERFORMANCE/SAFETY (currently it's buried after MOUTH), and prefix it as `PRIMARY ACTION (highest priority): …` so Kling weights it first.
- Make `SUBJECT` framing dynamic:
  - locked / natural / presenter → keep "medium close-up, head and shoulders"
  - expressive → "medium shot, head to hips, hands may enter frame"
  - cinematic → "medium to wide shot, full body may be visible, camera may reframe gently"
- Make `SAFETY` dynamic: drop "Hands stay completely out of frame" for expressive+, keep only "hands never cross or cover the mouth, face stays toward lens, mouth visible".

### B. Give the user the controls their prompt needs

- Unlock the **Camera move** row at Expressive (not only Cinematic), and add two more options: `orbit_lr` (slow orbit left→right) and `orbit_rl` (slow orbit right→left). Update `CAMERA_LINES` to describe each, and drop them from the negative prompt for those levels.
- Add a helper line above the textarea: *"Talking Video keeps the face toward the camera and the mouth closed for lip-sync. Walking, hand gestures, orbit camera and pose changes all work — full back turns, side profiles past 30°, and hands near the mouth do not."*
- Inline warning if the user types `walk|orbit|side angle|profile|full body|turn around` while on Still/Natural — surface a chip: "Switch to Expressive or Cinematic to enable this motion." (No autoswitch — user decides.)
- Optional: an "Apply suggested level" button that bumps to Cinematic + selects `orbit_lr` when the typed prompt contains orbit/walk keywords.

### C. Set the right expectation in the UI (`TalkingPerformancePicker.tsx` + `TalkingVideo.tsx`)

Add a small note under the action panel: *"For pure fashion / runway videos without speech, use **Start→End Video** or **Short Film** — those don't lock the mouth and can do full orbits and walking shots."* Deep-link to `/app/video/start-end` so users with prompts like yours land on the right tool.

## Files touched

- `supabase/functions/generate-talking-video/index.ts` — cap raise, reorder, dynamic SUBJECT/SAFETY, new camera moves, weaker negatives at higher levels.
- `src/components/app/video/TalkingPerformancePicker.tsx` — MAX_ACTION_LEN to 600, camera row visible at Expressive+, new orbit options, helper copy, conflict warning, deep link.
- `src/hooks/useTalkingVideoProject.ts` — `CameraMove` type adds `orbit_lr | orbit_rl`, client clamp to 600.
- `src/pages/video/TalkingVideo.tsx` — wire updated picker.

## Out of scope

- Switching providers (Sync.so / Seedance) — ruled out earlier in this thread, no real-face support or no lip-sync.
- Removing the MOUTH lock — it's load-bearing for lip-sync quality.
- Changing credit pricing.

## Open question

Your prompt is 100% a fashion runway shot — there's no speech in it. Do you want me to:
(a) just unlock Talking Video to allow walking + orbit while keeping the mouth lip-synced to a script, **or**
(b) also wire your prompt straight into Start→End Video / Short Film where there's no mouth lock and orbits already work, **or**
(c) both?
