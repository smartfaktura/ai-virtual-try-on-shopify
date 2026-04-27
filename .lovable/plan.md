
# Start & End Video — Implementation Plan (Kling-accurate)

A new premium video workflow at `/app/video/start-end` that generates a smooth, controlled transition between two uploaded images. Built on Kling's native start+end frame interpolation (`image` + `image_tail` on `kling-v3` `image2video`), with a custom prompt engine tuned to Kling's documented best practices.

---

## What the user gets

1. Upload **Start Image** + **End Image** (paired, side-by-side desktop / stacked mobile with arrow between)
2. Real-time **pre-flight validation** (file size, min resolution, aspect-ratio match)
3. **Compatibility card** (Strong / Good / Risky / Weak) computed from analyzing both images
4. Pick a **Transition Goal** (8 curated presets)
5. **Refine** transition (style, camera feel, motion strength, realism, smoothness, audio)
6. **Preservation Rules** (smart-defaulted from analysis: identity, product geometry, branding, etc.)
7. Optional **Transition Note** (free-text override, single sentence)
8. **Transition Summary** card → **Generate Transition Video** CTA with credit estimate

---

## Kling API reality check (drives the design)

Verified against official Kling docs + Novita / AnyFast / useapi mirrors:

| Concern | Decision |
|---|---|
| Endpoint | `POST {KLING_API_BASE}/videos/image2video` (already used by Animate flow) |
| Model | `kling-v3` in `pro` mode (best fidelity for transitions) |
| Start frame field | `image` (URL) |
| End frame field | **`image_tail`** (URL) — NOT `tail_image_url`, NOT `end_image_url` |
| Image constraints | `.jpg/.jpeg/.png`, ≤10MB, ≥300px each side, AR within 1:2.5–2.5:1, **start & end MUST share the same AR** |
| `cfg_scale` | **0.5** baseline; user "motion strength" maps to clamped 0.3–0.7 range only. Higher fights interpolation. |
| Duration | `"5"` only in v1. (`"10"` allowed by Kling but produces frozen middles on transitions; revisit in v2.) |
| `mode` | `"pro"` (1080p) |
| `negative_prompt` | yes — used to suppress morph/warp artifacts |
| `sound` | `"on"` if audio=ambient, else `"off"` |
| **Incompatible with `image_tail`** | `multi_prompt`, `camera_control`, `dynamic_masks`, `static_mask` — edge function must strip ALL of these for start-end jobs |
| Prompt length | hard cap 2500 chars; Kling recommends ~150–400 chars describing **the transition** only, not re-describing each frame |
| Aspect ratio param | NOT sent — Kling derives it from images. We compute `aspect_ratio` for our DB row from the start image. |

These constraints are enforced both in the prompt builder and in pre-flight validation — the user gets a clear error before we hit Kling on AR mismatch or undersized images.

---

## Backend prompt engine ("supergood prompting")

New file `src/lib/transitionPromptBuilder.ts` produces a Kling-tuned prompt with a **strict 5-clause structure**:

```
[ANCHOR] {what stays stable across both frames}
[MOTION] {transition verb + camera feel + pacing}
[STYLE]  {realism + lighting continuity + premium descriptors}
[GUARDS] {what must NOT distort: identity, product geometry, branding}
[FEEL]   {one-line emotional/brand tone}
```

Example output for *Product Evolution, Strong match, fragrance bottle*:

> Maintain bottle silhouette, label typography, glass reflections, and warm neutral lighting throughout. Transition with a slow, controlled push-in from the opening composition to the hero angle, motion intensity low, paced smoothly across 5 seconds. Photographic realism, continuous lighting family, premium editorial finish. Preserve product geometry, brand markings, and surface microtexture without warping or letter morph. Calm, luxurious, intentional.

Builder rules:

1. **Never re-describe both frames in detail.** Kling sees them. We only describe what *connects* them. (Common failure mode in naive integrations.)
2. **Anchor phrasing comes from `sharedElements`** returned by the compatibility resolver — concrete tokens like "bottle silhouette", "subject identity", "outfit silhouette".
3. **Negative prompt always set** — base set (`morphing, warping, distorted text, melting, jitter, ghost limbs, identity drift, label smearing, double exposure, abrupt cut, flicker`) plus contextual additions per goal (fashion adds `extra fingers, deformed hands`, etc.).
4. **Compatibility tier rewrites verbs**:
   - Strong → "smoothly evolve", "continuously transition"
   - Good → "transition with controlled motion"
   - Risky → "softly cross-fade through controlled camera movement"
   - Weak → "cinematically dissolve" + clamp `cfg_scale` to 0.3 (let Kling improvise)
5. **Goal-specific verb maps** — Smooth Reveal → "gradually unveil", Luxury Transition → "elegantly evolve", Pose-to-Pose Shift → "fluidly shift posture from … to …". No vague "smoothly transition between two images" output ever.
6. **Category-aware preservation language** appended from `transitionMotionRecipes.ts` (fragrance/fashion/jewelry contribute specific guard tokens).
7. **User's optional note** appended last as a single sentence — can override but not derail.
8. **Hard length guard**: assemble → trim from FEEL section first, then GUARDS; never trim ANCHOR or MOTION; final cap 2400 chars.

---

## Pre-flight validation (`src/lib/transitionPreflight.ts`)

Runs before sending to Kling, surfaces inline messages via existing `ValidationWarnings`:

- Both files present
- Each image ≤10MB, ≥300px each side
- Aspect ratios within 1:2.5–2.5:1
- **AR match check**: if start vs end AR differ by >5%, **block** with: *"Start and end images must have the same aspect ratio. Crop or re-upload."*
- File type whitelist (jpg/jpeg/png) — non-blocking warning suggesting re-export if webp

---

## Compatibility resolver (`src/lib/transitionCompatibilityResolver.ts`)

Pure function over two `VideoAnalysis` objects from existing `analyze-video-input` (already supports `image_urls: string[]`). Returns:

```ts
{
  tier: 'strong' | 'good' | 'risky' | 'weak';
  reason: string;             // user-facing one-liner
  recommendation?: string;
  sharedElements: string[];   // feeds prompt ANCHOR
  riskFlags: { angleShift, sceneShift, subjectShift, lightingShift };
}
```

Deterministic tier rules (no extra AI call):
- Same `subject_category` + matching product/identity + same lighting family → **strong**
- Same category, partial overlap → **good**
- Same category, large angle/scene/lighting shift → **risky**
- Different category → **weak** (suggest Ad Sequence)

Tier feeds: Compatibility card UI, default preservation toggles, prompt verb selection, and `cfg_scale` clamping.

---

## File-by-file changes

### Routing & hub
- `src/App.tsx` — lazy route `/app/video/start-end`
- `src/pages/VideoHub.tsx` — remove `disabled comingSoon` from existing card

### New page
- `src/pages/video/StartEndVideo.tsx` — slimmer than `AnimateVideo.tsx`. Two upload slots, validation, compatibility, goal/refinement/preservation state, summary, generate trigger. No bulk mode in v1.

### New components (`src/components/app/video/start-end/`)
- `StartEndUploadPair.tsx` — paired upload cards, chevron divider desktop / arrow icon between stacked cards mobile
- `CompatibilityCard.tsx`
- `TransitionGoalSelector.tsx` — 8 curated cards
- `TransitionRefinementPanel.tsx` — segmented controls
- `TransitionSummaryCard.tsx`

### Reused (no changes)
`PreservationRulesPanel`, `AudioModeSelector`, `CreditEstimateBox`, `ValidationWarnings`, `LibraryPickerModal`, `VideoResultsPanel`, `useFileUpload`, `useCredits`.

### New library files
- `src/lib/transitionPromptBuilder.ts` — 5-clause builder (above)
- `src/lib/transitionCompatibilityResolver.ts` — tier resolver (above)
- `src/lib/transitionPreflight.ts` — Kling input validation
- `src/lib/transitionMotionRecipes.ts` — `TRANSITION_GOALS`, `TRANSITION_STYLES`, `CAMERA_FEELS`, `MOTION_STRENGTHS`, `SMOOTHNESS_LEVELS`, category guard tokens, `getDefaultPreservationForTransition()`, `motionStrengthToCfgScale()` (returns 0.3–0.7 clamped)

### New hook
- `src/hooks/useStartEndVideoProject.ts` — pipeline:
  1. preflight validation
  2. analyze both images via `analyze-video-input`
  3. resolve compatibility (sync)
  4. build prompt + negative prompt + cfg_scale
  5. insert `video_projects` (`workflow_type: 'start_end'`) + 2× `video_inputs` (start `main_reference`, end `end_reference`)
  6. call `useGenerateVideo.startGeneration` with new `tailImageUrl` field; do NOT pass `cameraMotion`/`cameraControlConfig`

### Hook update
- `src/hooks/useGenerateVideo.ts` — add optional `tailImageUrl?: string` to `startGeneration` params; forward as `image_tail` in queue payload. Existing animate calls unaffected.

### Edge function (single careful change)
- `supabase/functions/generate-video/index.ts` (~lines 107–139):
  - Read `image_tail` from payload; if present:
    - Add `image_tail: <url>` to `klingBody`
    - **Strip** any `camera_control` / `dynamic_masks` / `static_mask` from the body (defensive — Kling rejects otherwise)
    - Allow caller-supplied `cfg_scale`; default 0.5 if missing
  - Log `has_tail: true` for observability
  - No changes to polling, storage, or downstream flows

### DB
- No schema migration. URLs stored: start as `source_image_url` on `generated_videos`; end on `settings_json.tailImageUrl` on `video_projects` and a `video_inputs` row with `input_role: 'end_reference'`.

### Credit pricing
- `src/config/videoCreditPricing.ts`: add `startEnd` block (`base5s: 12`, `ambient: 4`, `premiumTransition: 2` for Luxury/Cinematic). Slightly above Animate because Kling charges more for `image_tail` jobs in pro mode.
- Add `'startEnd'` to `VideoWorkflowType` and an `estimateStartEndCredits` branch.

---

## UX (high-level)

- Hero pair: `grid grid-cols-2 gap-4` desktop with absolute-centered chevron-right divider chip; stacks vertically on mobile with arrow-down icon between cards.
- Compatibility card uses calm brand badge variants — never alarming red even on weak tier.
- Transition Goal: 2-col mobile / 4-col desktop, ring + tinted bg on selected (matches `MotionGoalSelector`).
- Refinement: grouped segmented controls in 2-col responsive grid.
- Summary: muted bg, label · value rows.
- Generate row: credit estimate left, primary CTA right (matches `AnimateVideo`).
- Pre-flight errors render inline under the upload pair via existing `ValidationWarnings`.

---

## Out of scope (v1) — architecture left ready

- 10s duration (Kling supports it but quality drops on transitions)
- AI-generated mid-frames
- Multi-segment chains (DB already supports more `video_inputs` rows)
- Alternate endings
- `multi_prompt` mid-shot guidance (Kling forbids combining with `image_tail`)

---

## Acceptance

1. `/app/video/start-end` reachable from VideoHub.
2. Two mismatched-AR images shows a clear blocking validation message; Generate stays disabled.
3. Both images uploaded → analysis runs → Compatibility card shows tier + reason within ~3s.
4. Selecting a transition goal updates summary, preservation defaults, and prompt preview live.
5. Network tab shows Kling request body containing `image`, `image_tail`, `prompt` (≤2500 chars), `negative_prompt`, `cfg_scale` 0.3–0.7, `mode: "pro"`, `model_name: "kling-v3"`, NO `camera_control`.
6. Result video appears in `VideoResultsPanel` and library tagged `workflow_type: 'start_end'`.
7. Mobile: cards stack with directional cue, all controls reachable.
