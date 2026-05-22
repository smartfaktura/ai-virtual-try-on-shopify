# Brand Scene Wizard — close the remaining gaps

All saved scenes are previewed in the library at **4:5**, so the wizard should stop asking and just lock it. While we're in there, fill the holes that still cause weak generations.

## 1. Lock aspect ratio to 4:5

- Remove the **Aspect ratio** pill block from `Step3BaseAnswers.tsx`.
- `base.aspect_ratio` always written as `"4:5"` in `useWizardState` initial state and on every save.
- `buildBaseDirective` / `assembleSceneDirective` always emit `ASPECT RATIO: 4:5 (portrait, vertical)`.
- Schema keeps the field (for forward-compat) but it's no longer user-editable.
- Step 6 generation calls hard-code 4:5.

## 2. Step 3 — Scene aesthetic, add what's missing

Keep existing blocks (Scene type, Mood, Lighting, Framing, Time of day, Notes) and add:

- **Setting / environment** (single-select pills, optional): `Urban street`, `Architectural interior`, `Nature`, `Beach / water`, `Studio cyclorama`, `Tabletop surface`, `Vehicle / transit`, `Domestic`. Custom allowed.
- **Weather / atmosphere** (optional, single): `Clear`, `Overcast`, `Rain / wet`, `Fog / haze`, `Snow`, `Dusty / desert`, `Smoke / steam`.
- **Season** (optional, single): `Spring`, `Summer`, `Autumn`, `Winter`, `Season-less`.
- **Camera & lens** (optional, single pills, plain language — no mm jargon as primary label):  
  `Wide perspective (24mm)`, `Standard (35mm)`, `Portrait (50mm)`, `Tele compression (85mm)`, `Macro detail`.
- **Depth of field** (optional, single): `Deep — everything sharp`, `Balanced`, `Shallow — subject pop`, `Extreme bokeh`.
- **Color palette anchor** (optional): 6 curated swatches matching brand-memory palettes (Warm neutral, Cool neutral, Earthy terracotta, Sage & cream, Monochrome, Bold accent) **plus** a free-text "Custom palette" chip. Stored as `base.palette` (preset key + optional free text).
- **Finish / film look** (optional, single): `Clean digital`, `Soft film grain`, `Editorial matte`, `High-contrast glossy`, `Sun-bleached`.

All use the existing `<Chip>` + `AddChip` pattern — same visual language as Mood/Lighting today.

## 3. Step 4 — Cast & interaction, plug small holes

- **Wardrobe / styling color anchor** (optional, only when `hasPeople`): pill group with neutral-anchor + accent options, plus free-text. Stored as `cast.wardrobe_color`. Used so model outfits don't fight the product palette.
- **Cast scale relationship** (auto, no UI): when `cast.preset !== "none"` and product `scale.preset` is set, prompt assembler emits a sentence comparing cast height to product size (e.g. "product is handheld, ~20cm — sits in palm").
- Keep current Cast preset / People details / Interaction / Action / Scale / Note blocks unchanged.

## 4. Negative / avoid block — promote to its own step section

Currently `negative_note` lives only on the Review step. Add a compact **"Avoid in this scene"** textarea to **Step 3** (above Notes) so users set it when they're thinking about the look, not at the end. Keep the Review copy as read-only summary.

## 5. Prompt assembler updates

`assembleSceneDirective.ts` extended to render, in this order:

```text
SCENE TYPE: ...
SETTING: ...
WEATHER: ...
SEASON: ...
TIME OF DAY: ...
MOOD: ...
LIGHTING: ...
CAMERA: ... (lens) — DEPTH OF FIELD: ...
FRAMING: ...
ASPECT RATIO: 4:5 (portrait, vertical) — REQUIRED
COLOR PALETTE: ...
FINISH: ...
CAST: ... (+ wardrobe color, action, interaction)
PRODUCT SCALE: ... (+ cast-vs-product sentence)
REFERENCE INTENT: ... (only if reference flow)
NOTES: ...
AVOID: ...
```

Tests in `__tests__/` updated: aspect ratio always 4:5; new fields appear when set; assembler stable when fields are omitted.

## 6. Out of scope

- Wiring directive bundle into live `product-images` / `catalog` generation pipelines (separate PR).
- Library card layout changes — already 4:5.
- New persona/ethnicity fields on Cast (intentionally skipped; sensitive + brand-memory says no).

## Files

**Edited**
- `src/features/brand-scenes/wizard/steps/Step3BaseAnswers.tsx` — remove aspect ratio, add Setting / Weather / Season / Camera / DoF / Palette / Finish / Avoid blocks.
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` — wardrobe color block.
- `src/features/brand-scenes/wizard/steps/Step5Review.tsx` — show new fields read-only.
- `src/features/brand-scenes/wizard/useWizardState.ts` — default `aspect_ratio: "4:5"`, new setters.
- `src/features/brand-scenes/types.ts` & `schema.ts` — optional fields for setting, weather, season, lens, dof, palette, finish, wardrobe_color.
- `src/features/brand-scenes/prompt/assembleSceneDirective.ts` — render new fields, hard-code 4:5.
- `src/features/brand-scenes/prompt/buildCastDirective.ts` — emit wardrobe color + cast-vs-product sentence.

**New**
- `src/features/brand-scenes/wizard/constants/scene.ts` — settings, weather, season, lens, dof, palette, finish presets.
- `src/features/brand-scenes/__tests__/scene-extras.test.ts`
- `src/features/brand-scenes/__tests__/aspect-ratio-lock.test.ts`
