

# Analysis: Video Settings Audit + Fix Hover Flash

## 1. Fix: Video Hub Hover Flash

The flash happens because when you hover, the `<video>` element mounts with `opacity-0`, but there's a brief moment where the video element renders before `onCanPlay` fires. The black/white flash is the video element's default background appearing.

**Fix in `src/pages/VideoHub.tsx`**:
- Add `bg-transparent` to the video element
- Start with `visibility: hidden` until `canPlay` is true (instead of just opacity)
- Or simpler: keep the video element always mounted but hidden, and only show poster image swap after canPlay

## 2. Audit: What Actually Reaches Kling API

Here's exactly what the edge function (`generate-video/index.ts` line 124-134) sends to Kling's `image2video` endpoint:

| Setting in UI | Sent to Kling API? | How? |
|---|---|---|
| **Image URL** | YES | `image` field directly |
| **Prompt** (built from all category assemblers) | YES | `prompt` field — this is where ALL motion/camera/audio hints live |
| **Duration** (5s/10s) | YES | `duration` field |
| **Aspect Ratio** (9:16, 1:1, 16:9) | YES | `aspect_ratio` field |
| **Mode** (std/pro) | YES | `mode` field (hardcoded to `std`) |
| **Negative Prompt** | YES | `negative_prompt` field |
| **CFG Scale** | YES | `cfg_scale` field |
| **Audio** (silent/ambient) | YES | `sound: "on"/"off"` toggle |
| **Model Name** | YES | `model_name` (defaults to `kling-v3`) |
| **Camera Motion** | PROMPT ONLY | Baked into prompt text via `CAMERA_PHRASES` — no structured `camera_control` param sent |
| **Subject Motion** | PROMPT ONLY | Baked into prompt via strategy's `action_verb`/`action_style` |
| **Realism Level** | PROMPT + CFG | Affects prompt wording + adjusts `cfg_scale` |
| **Loop Style** | PROMPT ONLY | Appended as text clause |
| **Motion Intensity** | PROMPT ONLY | Wording only (subtle/moderate/dynamic) |
| **Preservation Rules** (scene, product, identity, outfit) | PROMPT ONLY | Text clauses like "Preserve: scene composition..." |
| **Audio Hints** | PROMPT ONLY | Appended text when ambient mode is on |
| **Product Category** | PROMPT ONLY | Selects which category assembler builds the prompt |
| **Scene Type** | PROMPT ONLY | Influences motion goal selection + audio hints |
| **Motion Goal** | PROMPT ONLY | Determines action verb/style/moving elements |
| **`camera_control_config`** | **NOT SENT** | Passed through to payload but the edge function **ignores it** (line 136 comment: "kling-v3 does NOT support structured camera_control") |

### Key Finding: `camera_control_config` is Dead Code
The strategy resolver computes it, `useGenerateVideo` includes it in the payload, but the edge function deliberately drops it. This is correct per Kling v3 docs — structured camera control isn't supported for image2video.

### What Actually Matters
Everything flows through the **prompt text**. The only Kling-native controls that affect output are:
1. `prompt` — the main driver of all motion/camera/style
2. `negative_prompt` — what to avoid
3. `cfg_scale` — prompt adherence strength
4. `sound` — on/off toggle
5. `duration` — 5 or 10 seconds
6. `aspect_ratio` — frame shape
7. `mode` — std vs pro quality

## Plan

### File 1: `src/pages/VideoHub.tsx` — Fix hover flash
- Add `poster` attribute to `<video>` pointing to the source image to prevent black frame flash
- Add `bg-transparent` styling
- Use `visibility: hidden` instead of `opacity-0` for the pre-canPlay state to fully prevent any rendering flash

### File 2: No code changes needed
The audit above is the deliverable — the settings pipeline is working as designed. All controls correctly funnel into prompt text since Kling v3 doesn't support structured params for image2video.

