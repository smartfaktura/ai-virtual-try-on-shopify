

# Prompt-Driven Audio Hints — Category × Scene × Motion-Aware

## Problem
When users select "Ambient" audio, the system only passes `withAudio: true` to Kling's API toggle. There's zero prompt-level guidance about **what** sounds should exist. Kling v3 generates better audio when the prompt describes the sonic environment — but our prompts currently say nothing about sound.

## Approach
Inject a precise, context-aware audio sentence into each category assembler's output. The hint is selected based on **three axes**: category, scene type, and motion goal — not just category alone. This ensures a fashion model on a runway gets "heels on polished floor" while a fashion flat-lay gets "soft fabric unfurling on paper."

## Audio Hint Architecture

### Tier 1: Category × Scene Matrix (specific)
Each combination gets a unique audio phrase. Examples:

| Category | Scene | Audio Phrase |
|---|---|---|
| Fashion | on_model | "subtle sound of heels on polished floor, soft fabric rustle with each movement" |
| Fashion | studio_product | "quiet studio hum, crisp sound of fabric being arranged on set" |
| Fashion | flat_lay | "soft paper texture, gentle placing of garments" |
| Beauty | hand_held | "smooth glass sliding against fingertips, soft cap twist" |
| Beauty | macro_closeup | "intimate close sound of cream texture, quiet glass surface tap" |
| Fragrance | studio_product | "glass bottle placed on marble, a single elegant spritz" |
| Fragrance | hand_held | "gentle rotation of glass in hand, quiet atomizer click" |
| Jewelry | macro_closeup | "delicate metallic shimmer, gem catching light with a crystalline ring" |
| Jewelry | on_model | "subtle chain movement against skin, quiet clasp sound" |
| Food | food_plated | "sizzling pan, steam rising, ceramic plate set on stone" |
| Food | hand_held | "liquid pouring into glass, ice clinking, condensation drip" |
| Home | interior_room | "distant wind through open window, clock ticking, curtain fabric shifting" |
| Electronics | device_on_desk | "soft keyboard tap, notification chime, quiet fan hum" |
| Electronics | hand_held | "smooth device pickup from desk, screen tap, haptic click" |
| Sports | action_scene | "sneaker squeak on court, ball impact, controlled breathing" |
| Sports | on_model | "athletic fabric stretch, rhythmic breathing, mat compression" |
| Health | studio_product | "clean bottle set down, capsule rattle, sealed cap opening" |
| Health | hand_held | "pill bottle shake, precise cap twist, tablet dropping into palm" |
| Accessories | hand_held | "leather creak, metal buckle click, stitched material handling" |
| Accessories | on_model | "watch clasp closing, subtle bag zip, material brushing against clothing" |

### Tier 2: Category Fallback (when scene combo not mapped)
One strong default per category used when the exact scene isn't in the matrix.

### Tier 3: Motion-Aware Modifiers
Certain motion goals append extra audio cues:
- `pour_and_reveal` → adds "with the sound of liquid flowing and settling"
- `steam_atmosphere` → adds "with gentle hissing steam rising"
- `editorial_walk_start` → adds "with confident footstep on hard floor"
- `warm_light_motion` → adds "with quiet candle crackle"
- `dynamic_training` → adds "with athletic exertion sounds and equipment impact"

## File Changes

### File 1: `src/lib/videoPromptTemplates.ts`

**Add** `PromptBuildInput.audioMode?: string` and `PromptBuildInput.sceneType?: string` to the interface.

**Add** a new `AUDIO_SCENE_HINTS` map: `Record<category, Record<sceneType, string>>` with ~50 specific entries covering all 10 categories × their relevant scene types.

**Add** `AUDIO_CATEGORY_FALLBACKS`: one default phrase per category.

**Add** `AUDIO_MOTION_MODIFIERS`: `Record<motionGoalId, string>` for ~8 motion goals that have distinctive sounds.

**Add** `buildAudioClause(family, sceneType, motionGoalId, audioMode)` function:
1. If `audioMode !== 'ambient'` → return empty string
2. Look up `AUDIO_SCENE_HINTS[category][sceneType]` → if found, use it
3. Else fall back to `AUDIO_CATEGORY_FALLBACKS[category]`
4. Append motion modifier if `motionGoalId` is in `AUDIO_MOTION_MODIFIERS`
5. Return formatted: `"Ambient sound: {phrase}."`

**Modify** `buildVideoPrompt()`: after single-shot guardrail, call `buildAudioClause()` and append result.

### File 2: `src/hooks/useVideoProject.ts`

**Modify** `runAnimatePipeline`: pass `audioMode` and `sceneType` into `buildVideoPrompt()` call (adding them to the input object alongside the existing `motionIntensity` and `preserveScene`).

### No UI changes needed
The existing Silent/Ambient toggle already controls `audioMode`. The audio hints are injected automatically at prompt construction time.

## Result
When a user selects "Ambient" on a jewelry macro close-up video, the prompt will end with:
> "Ambient sound: delicate metallic shimmer, gem catching light with a crystalline ring."

Instead of Kling guessing random ambient noise, it gets a precise sonic direction matched to exactly what's in the frame.

