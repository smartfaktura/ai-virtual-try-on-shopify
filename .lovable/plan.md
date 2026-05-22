## Brand Scenes Wizard — UX polish (Phase 7x)

Scope: `/app/brand-scenes/new`. UI/presentation only — no DB, no generation backend, no schema changes.

### 1. Sticky bottom bar — match Product Images

Replace the current `WizardLayout` footer (full-width sticky bar that sits flush with the page edges) with the same rounded "floating card" pattern used in `ProductImagesStickyBar`:

- `sticky bottom-4`, rounded-xl card, border + `bg-card/95` + backdrop-blur + shadow, safe-area padding.
- Left: tiny step dots (filled = done, scaled = current) + tiny label of current step.
- Right: Back (pill, ghost/outline) + Next (pill, primary, with `ArrowRight`).
- On the last step keep the disabled "Save scene" tooltip behavior.
- Keep current "soft-disabled → scroll to first `[data-missing="1"]`" behavior.
- Keep the inline destructive reason text above the bar when Next is soft-disabled.
- Mobile: stacked variant identical to ProductImages (dots + label row, then buttons row).

File: `src/features/brand-scenes/wizard/WizardLayout.tsx` — swap footer markup, drop the full-width border-top style.

### 2. Step 0 — no preselected card

`useWizardState.ts` initial state currently sets `source: "wizard"`, which makes the first card look preselected.

- Make `answers.source` optional (`BrandSceneSource | undefined`) in `BrandSceneAnswers`, default `undefined`.
- `Step0ChooseSource` renders neither card as active until the user clicks.
- `BrandSceneWizard` gates Next on step 0 with `!answers.source` → reason "Pick a starting point".
- Anywhere `answers.source === "reference"` is checked, treat `undefined` as wizard for layout purposes only (steps array, META) — actual gating still requires a pick before leaving step 0.

### 3. Step 1 — remove subtitle on family page

Drop `subtitle` for step 1 in `META_WIZARD` (`"Matches the 12 canonical families used across the app"`). Title stays.

### 4. Step 2 — remove the "Sub-family" tag chip

In `Step2ChooseSubFamily.tsx`, remove the `tag="Sub-family"` prop on each `WizardCard`. The page title already says "Choose a sub-family".

Also drop the redundant `META_WIZARD[2].subtitle` ("This becomes the catalog group your scene lives under").

### 5. Step progress — clickable to go back

In `WizardLayout`:

- Render each step bar as a button. Clicking a bar at index `i` where `i <= displayIdx` dispatches `setStep` to that step's `n`.
- Forward steps stay disabled / non-interactive.
- Add a step label under (or aria-label on) each bar so it's clear what each segment is. Use the existing `STEPS_WIZARD` / `STEPS_REFERENCE` labels.
- Visually: thin progress bars stay, but become focusable buttons with hover ring; small label text under each segment on `sm+`. On mobile keep label-less bars to save space.

Wire via a new `onGoToStep(step: WizardStep)` prop from `BrandSceneWizard`, which dispatches `setStep` only when target ≤ current and the step is in the active flow's step list.

### 6. Cleaner step titles + helpers

Tighten `META_WIZARD`:

```
0  "Where do we start?"               — (no subtitle)
1  "Pick a product family"            — (no subtitle)
2  "Pick a sub-family"                — (no subtitle)
3  "Who's in the scene?"              "Cast and how they relate to the product"
4  "Where does it happen?"            "Scene type first — settings unlock after"
5  "How is the photo taken?"          "Camera, light, color, finish — plain-language"
6  "Preview"                          "Review and generate variations"
7  "Review"                           "Confirm before saving"
```

### 7. Step 4 (Environment) — scene type first, reveal rest after

Restructure `Step4Environment.tsx` so initially only the **Scene type** picker is visible. The current "Pick a scene type above to unlock tailored settings" hint is replaced with a single primary card containing the picker.

After `value.scene_type` is set:

- A divider appears, then "Setting / environment", "Weather", "Season", "Brand voice", "Aesthetic era", "Prop density", "Avoid", "Notes", and the "Optional fine-tuning" group.
- Mount these inside an animated container (simple `[hidden]` + transition or just conditional render — no motion library beyond what's already used).
- If user clears `scene_type`, the secondary fields collapse again.

### 8. Step 5 (Photography & edit) — plain-language relabel

Rename the Section labels to friendly equivalents (and add a one-line helper under each label via a new optional `helper` prop on `Section`, or via an inline `<p className="text-xs text-muted-foreground">`):

| Old | New | Helper |
|---|---|---|
| Camera & lens | Lens look | Wide = roomy and dramatic. Long = compressed and flattering. |
| Depth of field | How blurry the background is | Shallow = creamy bokeh. Deep = everything in focus. |
| Composition geometry | How the shot is composed | Where the product sits inside the frame. |
| Negative-space intent | Empty space around the product | Tight = packed. Generous = lots of breathing room. |
| Subject focus | What the eye lands on first | Product, model, or both equally. |
| Shadows / reflections | Shadows | Soft = gentle. Hard = bold edges. |
| Realism level | How realistic | Photo-real vs stylized. |
| Color palette anchor | Color palette | Anchor color story for the shot. |
| Color contrast | Contrast | How punchy lights vs darks should feel. |
| Saturation | Color intensity | Muted, true, or vivid. |
| Finish / film look | Film / finish look | Final grade — clean, filmic, glossy, etc. |

Group label "Camera" → "Camera angle". "Composition & crop" → "Motion & crop".

### 9. Better compiled prompt (Gemini-style)

Rewrite `assembleSceneDirective` so the output reads like a structured Gemini image prompt instead of a flat list of `Key: value.` lines. Same inputs, much richer output.

New structure (sections only emitted when relevant data exists):

```
ROLE
You are a commercial product-photography art director. Produce one
hero image for an e-commerce brand scene.

SUBJECT
- Family: <family> / <sub-family>
- Cast: <cast preset + interaction, scale, ethnicity if set>
- Product scale: <…>

SCENE
- Scene type: <…>
- Setting: <… on <surface>>
- Weather / season: <…>
- Time & light: <time_of_day_detail, light_direction, light_quality>
- Mood: <mood — brand voice — era — realism, joined with em-dashes>

CAMERA
- Lens: <…>
- Depth of field: <…>
- Framing & composition: <framing — composition — negative-space>
- Subject focus: <…>

COLOR & FINISH
- Palette: <preset directive or custom>
- Contrast / saturation: <…>
- Finish: <…>

STYLING DETAILS (only if any extras present)
- Backdrop: <backdrop_type, color/gradient, floor, studio_fx>
- Other styling: <remaining scene extras as "label: value" bullets>

CAST DETAILS (only if any cast extras present)
- Skin / hair / makeup / pose / storytelling bullets

OUTPUT
- Aspect ratio: 4:5 (portrait) — REQUIRED.
- Use case: <…> (if set)
- Prop density: <label> (level n/4) (if set)

NEGATIVE
- Avoid: <…>

NOTES
- <free notes>

REFERENCE (only if reference flow)
- <reference directive>

NAME
- <scene name>
```

Implementation:

- Keep the existing helper imports (`meta`, `metaX`, etc.).
- Build per-section string arrays; only push a section header + bullets when the array is non-empty.
- Reuse `buildCastDirective`, `buildScaleDirective`, `buildReferenceDirective` outputs — embed them under SUBJECT / REFERENCE rather than as flat lines.
- Group scene extras by the same `ENV_GROUPS` / `PHOTO_GROUPS` buckets used in the UI so the prompt mirrors the user's mental model. Backdrop/floor/light → SCENE. Camera-angle / composition_energy / crop_safety / motion → CAMERA.
- Final string joins with `\n`. Add a small jsdoc explaining the format.
- Update the existing `assembleSceneDirective` unit test snapshot(s) if any — search and adjust expected strings.

The admin "Compiled prompt" panel in Step 6 + Step 7 picks up the new output automatically.

### Files

**Modified**
- `src/features/brand-scenes/wizard/WizardLayout.tsx` — new sticky bar styling + clickable progress
- `src/features/brand-scenes/wizard/BrandSceneWizard.tsx` — META copy, step 0 gating, `onGoToStep`
- `src/features/brand-scenes/wizard/useWizardState.ts` — `source: undefined` default
- `src/features/brand-scenes/types.ts` — make `source` optional on `BrandSceneAnswers`
- `src/features/brand-scenes/wizard/steps/Step0ChooseSource.tsx` — accept `undefined`
- `src/features/brand-scenes/wizard/steps/Step2ChooseSubFamily.tsx` — drop tag
- `src/features/brand-scenes/wizard/steps/Step4Environment.tsx` — scene-type-first reveal
- `src/features/brand-scenes/wizard/steps/Step5Photography.tsx` — plain-language labels + helper text
- `src/features/brand-scenes/wizard/components/Section.tsx` — optional `helper` prop
- `src/features/brand-scenes/prompt/assembleSceneDirective.ts` — structured Gemini-style output
- Any failing `assembleSceneDirective` test under `src/features/brand-scenes/__tests__/`

**No changes**: prompt builders for cast/scale/reference, schemas, generation pipeline, RLS, edge functions.

### Out of scope

- Generation backend (still disabled CTA).
- Reference-flow redesign beyond what's needed for step 0 gating.
- Category-specific module questions (already removed in 7w).
