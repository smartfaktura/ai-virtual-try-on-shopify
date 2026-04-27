
# Start & End Video — Implementation Plan (Kling-accurate)

A new premium video workflow at `/app/video/start-end` that generates a smooth, controlled transition between two uploaded images. Built directly on Kling's native start+end frame interpolation (`image` + `image_tail` on `kling-v3` `image2video`), with a custom prompt engine tuned to Kling's documented best practices.

---

## What the user gets

1. Upload **Start Image** + **End Image** (paired, side-by-side)
2. Real-time **Pre-flight validation** (size, aspect-ratio match, resolution)
3. **Compatibility card** (Strong / Good / Risky / Weak) from analysis of both images
4. Pick a **Transition Goal** (8 curated presets)
5. **Refine** transition (style, camera feel, motion strength, realism, smoothness, duration, audio)
6. **Preservation Rules** (smart-defaulted from analysis)
7. Optional **Transition Note**
8. **Transition Summary** card → **Generate Transition Video**

---

## Kling API reality check (this drives the design)

Verified against official Kling docs + Novita/AnyFast/useapi mirrors:

| Concern | Decision |
|---|---|
| Endpoint | `POST {KLING_API_BASE}/videos/image2video` (already used) |
| Model | `kling-v3` in `pro` mode (best fidelity for transitions) |
| Start frame field | `image` (URL) |
| End frame field | **`image_tail`** (URL) — NOT `tail_image_url`, NOT `end_image_url` |
| Image constraints | `.jpg/.jpeg/.png`, ≤10MB, ≥300px per side, AR between 1:2.5 and 2.5:1, **start & end MUST share the same aspect ratio** |
| `cfg_scale` | **0.5** (Kling's recommended sweet spot for start+end; higher stiffens motion and fights interpolation). Ignore the user's "motion strength" → we map it to a small range 0.3–0.7, never higher. |
| Duration | `"5"` only for v1. (`"10"` is allowed by Kling but produces frozen middles on transitions — we hide it for v1; the spec says 5/10 but we'll ship 5 only and note 10 as v2.) |
| `mode` | `"pro"` (1080p) |
| `negative_prompt` | yes — used to suppress morph artifacts |
| `sound` | `"on"` if audio=ambient, else `"off"` |
| **Incompatible with `image_tail`** | `multi_prompt`, `camera_control`, `dynamic_masks`, `static_mask` — we drop ALL of these for start-end jobs (current `useGenerateVideo` passes `cameraControlConfig` for animate; we must omit it here) |
| Prompt length | hard cap 2500 chars; Kling docs recommend ~150–400 chars describing **the transition** only, not re-describing each frame |
| Aspect ratio param | NOT sent — Kling derives it from the images. We compute `aspect_ratio` for our DB row from the start image. |

These constraints are enforced both in the prompt builder and as pre-flight validation — the user gets a clear error before we hit Kling if AR mismatches or images are too small.

---

## Backend prompt engine (the core of "supergood prompting")

New file `src/lib/transitionPromptBuilder.ts` produces a Kling-tuned prompt with a **strict 5-clause structure**:

```
[ANCHOR] {what stays stable across both frames}
[MOTION] {the transition verb + camera feel + pacing}
[STYLE]  {realism + lighting continuity + premium descriptors}
[GUARDS] {what must NOT distort: identity, product geometry, branding}
[FEEL]   {one-line emotional/brand tone}
```

Example output for *Product Evolution, Strong match, fragrance bottle*:

> Maintain bottle silhouette, label typography, glass reflections, and warm neutral lighting throughout. Transition with a slow, controlled push-in from the opening composition to the hero angle, motion intensity low, paced smoothly across 5 seconds. Photographic realism, continuous lighting family, premium editorial finish. Preserve product geometry, brand markings, and surface microtexture without warping or letter morph. Calm, luxurious, intentional.

Key implementation rules in the builder:

1. **Never re-describe both frames in detail.** Kling sees them. We describe only what *connects* them. (Common failure mode in naive implementations.)
2. **Anchor phrasing comes from `sharedElements`** returned by the compatibility resolver — concrete tokens like "bottle silhouette", "label typography", "subject identity", "outfit silhouette".
3. **Negative prompt is always set** — built from a base set (`morphing, warping, distorted text, melting, jitter, ghost limbs, identity drift, label smearing, double exposure, abrupt cut, flicker`) plus contextual additions per transition goal (e.g. fashion adds `extra fingers, deformed hands`).
4. **Compatibility tier rewrites verbs**:
   - Strong → "smoothly evolve", "continuously transition"
   - Good → "transition with controlled motion"
   - Risky → "softly cross-fade through controlled camera movement" (less continuity claim)
   - Weak → "cinematically dissolve" + reduce `cfg_scale` to 0.3 (let Kling improvise)
5. **Goal-specific verb maps** — `Smooth Reveal` → "gradually unveil", `Luxury Transition` → "elegantly evolve", `Pose-to-Pose Shift` → "fluidly shift posture from … to …", etc. No vague "smoothly transition between two images" output ever.
6. **Category-aware preservation language** is appended from `transitionMotionRecipes.ts` (fragrance/fashion/jewelry/etc. each contribute specific guard tokens).
7. **User's optional note** is appended last as a single sentence so it can override but not derail.
8. **Hard length guard**: assemble → trim to 2400 chars from the FEEL section first, then GUARDS, never trimming ANCHOR or MOTION.

---

## Pre-flight validation (`src/lib/transitionPreflight.ts`)

Runs before sending to Kling, surfaces inline warnings in `ValidationWarnings`:

- Both files present
- Each image ≤10MB, ≥300px each side
- Aspect ratios within 1:2.5–2.5:1
- **AR match check**: if start AR differs from end AR by >5%, block with clear message: *"Start and end images must have the same aspect ratio. Crop or re-upload."* (Kling will reject otherwise.)
- File type whitelist (jpg/jpeg/png) — surfaces a non-blocking warning suggesting re-export if webp.

---

## Compatibility resolver (`src/lib/transitionCompatibilityResolver.ts`)

Pure function over two `VideoAnalysis` objects from `analyze-video-input` (already supports `image_urls: string[]`). Returns:

```ts
{
  tier: 'strong' | 'good' | 'risky' | 'weak';
  reason: string;            // user-facing one-liner
  recommendation?: string;    // optional suggestion
  sharedElements: string[];   // feeds prompt ANCHOR
  riskFlags: { angleShift, sceneShift, subjectShift, lightingShift };
}
```

Tier rules (deterministic, no extra AI call):
- Same `subject_category` + same product/identity signal + same lighting family → **strong**
- Same category, partial overlap → **good**
- Same category, large angle/scene/lighting shift → **risky**
- Different category → **weak** (suggests Ad Sequence)

Tier feeds: the Compatibility card UI, default preservation toggles, prompt verb selection, and `cfg_scale` clamping.

---

## File-by-file changes

### Routing & hub
- `src/App.tsx` — lazy route `/app/video/start-end`
- `src/pages/VideoHub.tsx` (lines 207–208) — remove `disabled comingSoon` from the existing card

### New page
- `src/pages/video/StartEndVideo.tsx` — slimmer than `AnimateVideo.tsx`. Manages two upload slots, validation, compatibility, goal/refinement/preservation state, summary, generate trigger. No bulk mode in v1.

### New components (`src/components/app/video/start-end/`)
- `StartEndUploadPair.tsx` — paired upload cards with chevron divider (desktop) / arrow icon between stacked cards (mobile)
- `CompatibilityCard.tsx`
- `TransitionGoalSelector.tsx` — 8 curated cards
- `TransitionRefinementPanel.tsx` — segmented controls
- `TransitionSummaryCard.tsx`

### Reused (no changes)
`PreservationRulesPanel`, `AudioModeSelector`, `CreditEstimateBox`, `ValidationWarnings`, `LibraryPickerModal`, `VideoResultsPanel`, `useFileUpload`, `useCredits`.

### New library files
- `src/lib/transitionPromptBuilder.ts` — described above
- `src/lib/transitionCompatibilityResolver.ts` — described above
- `src/lib/transitionPreflight.ts` — Kling input validation
- `src/lib/transitionMotionRecipes.ts` — `TRANSITION_GOALS`, `TRANSITION_STYLES`, `CAMERA_FEELS`, `MOTION_STRENGTHS`, `SMOOTHNESS_LEVELS`, category guard tokens, `getDefaultPreservationForTransition()`, `motionStrengthToCfgScale()` (returns 0.3–0.7 clamped)

### New hook
- `src/hooks/useStartEndVideoProject.ts` — pipeline:
  1. preflight validation
  2. analyze both images via `analyze-video-input`
  3. resolve compatibility (sync)
  4. build prompt + negative prompt + cfg_scale
  5. insert `video_projects` (`workflow_type: 'start_end'`) + 2× `video_inputs` (start role `main_reference`, end role `end_reference`)
  6. call `useGenerateVideo.startGeneration` with new `tailImageUrl` field; do NOT pass `cameraMotion`/`cameraControlConfig`

### Hook update
- `src/hooks/useGenerateVideo.ts` — add optional `tailImageUrl?: string` to `startGeneration` params; forward as `image_tail` in the queue payload. Existing animate calls unaffected.

### Edge function (single small, careful change)
- `supabase/functions/generate-video/index.ts` (~lines 107–139):
  - Read `image_tail` from payload; if present:
    - Add `image_tail: <url>` to `klingBody`
    - **Strip** any `camera_control` / `dynamic_masks` / `static_mask` from the body (defensive — Kling rejects the call otherwise)
    - Allow caller-supplied `cfg_scale` (already supported); default to 0.5 if missing
  - Log `has_tail: true` for observability
  - No changes to polling, storage, or downstream flows

### DB
- No schema migration. Both URLs stored: start as `source_image_url` on `generated_videos`; end on a new `settings_json.tailImageUrl` field on `video_projects` and a `video_inputs` row with `input_role: 'end_reference'`.

### Credit pricing
- `src/config/videoCreditPricing.ts`: add `startEnd` block (`base5s: 12`, `ambient: 4`, `premiumTransition: 2` for Luxury/Cinematic styles). Slightly above animate because Kling charges more for image_tail jobs in pro mode.
- Add `'startEnd'` to `VideoWorkflowType` and an `estimateStartEndCredits` branch.

---

## UX (high-level)

- Hero pair: `grid grid-cols-2 gap-4` desktop with absolute-centered chevron-right divider chip; stacks vertically on mobile with arrow-down icon between cards.
- Compatibility card uses calm brand badge variants — never alarming red even on weak.
- Transition Goal: 2-col mobile / 4-col desktop, ring + tinted bg on selected (matches `MotionGoalSelector`).
- Refinement: grouped segmented controls in 2-col responsive grid.
- Summary: muted bg, label · value rows.
- Generate row: credit estimate left, primary CTA right (matches `AnimateVideo`).
- Pre-flight errors render inline under the upload pair via existing `ValidationWarnings`.

---

## Out of scope (architecture left ready)

- 10s duration (Kling supports it but quality is lower for transitions — enable in v2 with a warning)
- AI-generated mid-frames
- Multi-segment chains (DB already supports more `video_inputs` rows)
- Alternate endings
- `multi_prompt` mid-shot guidance (Kling forbids combining it with `image_tail`)

---

## Acceptance

1. `/app/video/start-end` reachable from VideoHub.
2. Uploading two mismatched-AR images shows a clear blocking validation message and the Generate button stays disabled.
3. Both images uploaded → analysis runs → Compatibility card shows tier + reason within ~3s.
4. Selecting a transition goal updates the summary, preservation defaults, and prompt preview live.
5. Network tab shows the Kling request body containing `image`, `image_tail`, `prompt` (≤2500 chars), `negative_prompt`, `cfg_scale` 0.3–0.7, `mode: "pro"`, `model_name: "kling-v3"`, NO `camera_control`.
6. Result video appears in `VideoResultsPanel` and the user's library tagged `workflow_type: 'start_end'`.
7. Mobile: cards stack with directional cue, all controls reachable.
