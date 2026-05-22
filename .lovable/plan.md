# Phase 7y — Prompt quality, merged Preview+Review, family-step copy

Three focused refinements to `/app/brand-scenes/new`. Frontend/presentation only — no backend, schema, or generation-pipeline changes.

## 1. Rewrite compiled prompt for Gemini / Nano Banana

File: `src/features/brand-scenes/prompt/assembleSceneDirective.ts`

Today the output is a flat list of `Key: value.` lines. Gemini image models respond better to **role + natural-language paragraphs + structured cues**, not enumerated `x = x` fields.

New shape (sections only emitted when they have content):

```text
ROLE
You are a commercial product-photography art director. Generate ONE
photoreal hero image for an e-commerce brand scene. No text, logos, or
watermarks. Aspect ratio 4:5 portrait — REQUIRED.

SUBJECT
{cast woven into a sentence}, {interaction with product}. Product shown
at {scale} scale.

SCENE
{Setting}. {Weather}, {season}. Mood: {mood + brand voice + era + realism}.
Lighting: {lighting + shadow phrasing}.

CAMERA & FRAMING
Shot on {lens phrasing} with {depth-of-field phrasing}. Framing:
{framing + composition + neg-space}. Subject focus: {focus}.

COLOR & FINISH
Palette: {palette}. Contrast {contrast}, saturation {saturation}.
Final grade: {finish}.

STYLING DETAILS
- Backdrop: …
- Floor: …
- (one bullet per non-empty scene extra)

CAST DETAILS
- Ethnicity: …
- Wardrobe: …
- (one bullet per non-empty cast extra)

OUTPUT
Aspect ratio: 4:5 portrait. Prop density: {label}. Intended use: {use-case}.

NEGATIVE
Avoid: {avoid}. Do not render text, logos, watermarks, or extra products.

NOTES
{free notes verbatim}

REFERENCE
{reference intent sentence}

NAME
{scene name}
```

Implementation notes:
- Add a small `sentence(parts: string[])` helper that joins fragments, capitalizes, and appends a period.
- SUBJECT / SCENE / CAMERA & FRAMING / COLOR & FINISH become 1–2 natural sentences. STYLING DETAILS / CAST DETAILS stay as `- Label: value` bullet lists (Gemini parses bullets reliably and downstream tests can still grep individual labels).
- **Preserve every existing canonical label and directive substring** so the test suite continues to pass:
  - `scene-extras.test.ts` expects: `Setting: …`, `Weather: …`, `Season: …`, `Camera: 50mm portrait …`, `Depth of field: shallow …`, `Color: earthy…`, `Finish: subtle film grain …`, `Aspect ratio: 4:5`, `Avoid: …`, `Wardrobe: earth-tone…`, `Cast-vs-product: product is held…`.
  - `scene-dials.test.ts` expects: `Setting: Tabletop surface on polished stone slab`, `Mood:.*premium quiet brand voice`, `Lighting:.*soft diffuse shadows`, `Framing:.*rule-of-thirds.*headline`, `Color:.*bold high contrast.*vivid`, `Subject focus: product is the hero focus`, `Prop density: Considered \(level 2/4\)`, `Output: designed for website hero`, `Hands: both hands cradling`, `Body-part focus: hands`.
  - `aspect-ratio-lock.test.ts`, `extras-dials.test.ts`, `wizard-polish-7n/7o`, `review-summary-7l` — all keep their substrings.
- Strategy: keep each canonical fragment intact (`Setting: …`, `Camera: …`, etc.) but compose them into structured sentences within each section, e.g.
  `SCENE\nSetting: Tabletop surface on polished stone slab. Weather: rain. Season: autumn. Mood: premium quiet brand voice — quiet luxury — high realism. Lighting: soft natural light — soft diffuse shadows.`
  This reads as prose to Gemini while staying greppable.
- ROLE block strengthened with explicit "photoreal, no text/watermarks, 4:5".
- NEGATIVE always appends the standard "Do not render text, logos, watermarks, or extra products." clause when the section is emitted.

No new tests required; existing assertions act as the regression net.

## 2. Merge "Preview & pick" and "Review" into one step

Steps 6 (`Step6PreviewAndPick`) and 7 (`Step5Review`) currently overlap — both summarize answers and both have admin debug panels. Collapse into a single final step.

Files:
- `src/features/brand-scenes/wizard/useWizardState.ts` — reduce `WizardStep` union to `0..6`, `MAX_STEP = 6`.
- `src/features/brand-scenes/wizard/BrandSceneWizard.tsx` — drop step 7 case; update `META_WIZARD` / `META_REFERENCE` so step 6 is the final step; `isLastStep = step === 6`; reference flow's existing jump from step 4 → step 6 still lands on the unified final step.
- `src/features/brand-scenes/wizard/WizardLayout.tsx` — update step labels / dots / progress for the new count (wizard flow = 7 steps 0–6; reference flow = 6 steps).
- `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx` — rewritten as the unified final step (see content below).
- Delete `src/features/brand-scenes/wizard/steps/Step5Review.tsx` after porting reusable pieces (`SummaryCard`, `Bucket`, `ReferenceSummary`, helpers) into the unified step or a small shared file.
- Update/delete any test that imports `Step5Review` directly and re-point references to the unified step. `review-summary-7l.test.tsx` content checks should still pass against the merged step.

Unified final step content (in order):
1. **Hero card** — `Ready to generate · 3 variations · 4:5 · {N} credits` + `Generate 3 variations` CTA (still disabled with existing tooltip).
2. **Variant placeholders** — three 4:5 dashed tiles.
3. **Reference summary card** — when `source === "reference"` (ported from Step5Review).
4. **Full structured Summary** — Scene / Look & light / Cast / Output buckets via the ported `SummaryCard`.
5. **Avoid block** — when present.
6. **Admin debug** (admin only) — single instance of collapsible "Compiled prompt" + "Raw payload" panels.

New step labels:
- `META_WIZARD[6] = { title: "Review & generate", subtitle: "Final check before generating variations" }`
- `META_REFERENCE[6]` mirrors it.

## 3. Step 1 subtitle copy

File: `src/features/brand-scenes/wizard/BrandSceneWizard.tsx`

`META_WIZARD[1]` and `META_REFERENCE[1]` both get:

```ts
1: {
  title: "Pick a product family",
  subtitle: "Your saved scene will appear under this category in your library",
},
```

(No terminal period — single-sentence subtitle, per core memory rule.)

---

## Out of scope
- No changes to generation pipeline, edge functions, RLS, schemas, or stored prompt templates.
- No new generation UI (CTA stays disabled).
- No changes to Steps 0, 2, 3, 4, 5 logic — only the final step is restructured and the family-step subtitle is added.

## Test impact
- All `assembleSceneDirective` assertions preserved by keeping canonical fragments inside the new sentences.
- Step-count / final-step assertions updated where they hard-code 7.
- Delete obsolete `Step5Review` and update any direct import.
- Target: all 175 tests green.
