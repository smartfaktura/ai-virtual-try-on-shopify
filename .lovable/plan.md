# More action in Talking Video

## Why it feels static today

Talking Video runs in two stages: Kling generates the base clip from the photo, then Kling lip-sync paints the mouth onto it from the ElevenLabs audio. To keep lip-sync clean, the current base prompt locks almost everything: tripod camera, no body movement, mouth closed, no hand gestures, no scene motion. That's why even "Presenter" still feels like a stiff portrait. The constraint that matters is the **mouth** — body, scene, lighting and slow camera motion can all move freely without hurting the sync.

## Model choice

Stay on Kling for both stages. It's the only path that accepts user-uploaded real faces, gives us motion control, and already powers the lip-sync. Seedance 2.0 was ruled out earlier (no real faces). Sync.so only replaces lip-sync, not the base clip — it would not add action. The win here is **prompt and UI**, not a new model.

## What changes

### 1. New "Action & scene" panel (between Performance and Duration)
A dedicated section so users can dial in motion without fighting the existing Energy/Eye-contact controls.

- **Action level** (4 chips, replaces today's 3-tier Energy):
  - Still — current `locked`
  - Natural — current `natural`
  - Presenter — current `presenter`
  - **Expressive (new)** — subtle hand-in-frame gestures, light shoulder/torso sway, head turns within ±15°, gentle ambient scene motion (hair, fabric, background life)
  - **Cinematic (new)** — Expressive plus slow controlled camera push-in OR slow pull-out (one choice, never both), shallow parallax, atmospheric motion (steam, dust, soft wind)
- **Custom action prompt** (textarea, optional, max 240 chars):
  - Placeholder: `e.g. holds the bottle up to the light, soft scarf flutter, slow step forward`
  - Live chip suggestions inserted into the field: "hand gesture", "slow walk forward", "hair in breeze", "turn shoulder", "lift product", "ambient steam"
  - Helper line under it: "Describe body, hands, scene or camera motion. Mouth and lip-sync are handled automatically — don't describe speaking."
- **Camera move** (only visible when level = Cinematic): None / Slow push-in / Slow pull-out / Slow arc — single select chip row

### 2. Prompt builder rewrite (edge function)
`buildStructuredPrompt` is split into MOUTH-LOCKED block (always strict) + BODY/SCENE/CAMERA block (driven by the new controls).

- MOUTH block stays exactly as today (closed, relaxed, clean canvas for lip-sync). Non-negotiable.
- BODY/PERFORMANCE block expands per Action level. Expressive adds: "Natural hand gestures may briefly enter frame below the chin; gentle shoulder shift; head free to settle ±15°". Cinematic adds the chosen camera move sentence.
- SCENE block appends the custom action prompt verbatim, prefixed with `ACTION:` and clamped to 240 chars. We sanitize it server-side by stripping any words that would interfere with lip-sync (regex on `talk|speak|mouth|lip|smile|laugh|shout|sing|whisper`) and append a short reminder if any were stripped.
- NEGATIVE prompt becomes tiered:
  - Always-on (mouth/face): keep today's `talking, mouthing, lip flapping, open mouth, teeth, tongue, hand over mouth, finger near mouth`
  - Drop when level ≥ Expressive: `dramatic gesture, fast motion, head turning away`
  - Drop when level = Cinematic: `camera movement, pan, zoom, dolly` (replaced by an explicit allowed-camera-move clause)

### 3. Types and payload
- `Motion` type gains `'expressive' | 'cinematic'`.
- `Performance` interface gains `cameraMove?: 'none' | 'push_in' | 'pull_out' | 'arc'` and `actionPrompt?: string`.
- `useTalkingVideoProject.start()` forwards them through to the existing `payload.performance` and `payload.scene_hint` fields (no queue contract change).

### 4. Pricing (no change)
Same Kling base cost — we're only changing the prompt and a few UI fields, not adding a render pass. Credit rules stay 22/36.

### 5. Safeguards
- If both a strong custom prompt AND level = Still are selected, show inline warning "Action prompt is ignored at Still level — pick Natural or higher".
- Strip the custom prompt to ASCII-friendly punctuation and clamp 240 chars client-side before submit (server re-clamps).
- Keep `scene_hint` as a separate optional field (it controls styling), distinct from `actionPrompt` (controls motion).

## Files touched

- `src/pages/video/TalkingVideo.tsx` — render new section, wire state
- `src/components/app/video/TalkingPerformancePicker.tsx` — extend Energy chips, add camera-move row, add action-prompt textarea + chip suggestions
- `src/hooks/useTalkingVideoProject.ts` — pass new fields in payload
- `supabase/functions/generate-talking-video/index.ts` — `Motion` type, `MOTION_LINES`, `buildStructuredPrompt`, tiered `NEGATIVE_PROMPT`, sanitizer for custom prompt

## Out of scope

- No new provider (Sync.so, Seedance) — those were evaluated above and don't fit.
- No change to lip-sync stage, polling, or queue resolver.
- No change to credit pricing.
