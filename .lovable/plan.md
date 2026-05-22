## Phase 7a polish — round 2 (wizard clarity, scene-not-brand framing)

Scope: **frontend only**. Schemas/RLS untouched. Generation pipeline (Phase 7b) will consume the new shape unchanged via the same `module_answers` JSONB blob — just with fewer keys.

### 1. Drop "Archetype" and "Garment focus" from Fashion module

`modules/fashion/FashionQuestions.tsx`, `modules/fashion/schema.ts`, `modules/fashion/questions.ts`, `BrandSceneWizard.tsx` (validator)

- **Archetype** ("Editorial Studio / Elevated Location / Everyday UGC / Campaign Statement") is too abstract and overlaps with the new Scene-aesthetic step. Remove it from the form, from the schema (`.archetype` becomes optional with `.default(undefined)` then dropped), and from `isFashionStepValid`.
- **Garment focus** is redundant — user already picked a sub-family (e.g. "Outerwear", "Knitwear") in Step 2. Remove the chip group and the `garment_focus` requirement from `isFashionStepValid`.
- Schema: keep `garment_focus` and `archetype` as **optional** fields (so older saved rows still parse) but no UI writes them. Validator now only requires `wearer`.
- Same treatment applied to Footwear and Eyewear is **out of scope** for this round — user only flagged Fashion. We'll mirror later if confirmed.

### 2. Replace bespoke "Scene setting / Location specifics / Props & styling / Finishing / Color anchor / Camera feel" with one clean pill-driven block

`modules/fashion/FashionQuestions.tsx`

After Wearer, render a single **"Scene details"** block with chip-style selectors (same pill component used everywhere else — see section 6 for the shared `Chip`). Free-text inputs become optional collapsible add-ons via a small "+ Add custom" pattern, mirroring the new aesthetic step.

Replace the five separate Inputs with **3 chip groups + 2 optional text escape hatches**:

| Field | Type | Presets |
|---|---|---|
| Setting | single-select chips | Indoor studio · Indoor lifestyle · Outdoor street · Outdoor nature · Architectural · Domestic interior |
| Vibe / props | multi-select chips (max 3) | Minimal · Vintage props · Floral · Industrial · Soft drapery · Plants · Tabletop · Empty space |
| Camera feel | multi-select chips (max 2) | Wide editorial · Tight crop · 35mm film · Soft DOF · Documentary · Flash-lit |
| Color anchor *(optional)* | small text input below chips | placeholder "e.g. warm sand, smoked olive" |
| Pose / energy *(only when on-model)* | small text input | placeholder "e.g. leaning relaxed, hand in pocket" |

Mapping into existing schema (no migration): `scene.location` ← Setting label, `scene.props` ← joined Vibe chips, `finishing.color_anchor` ← text, `finishing.camera_feel` ← chip array, `scene.pose` ← text. Schema stays untouched.

### 3. Same field treatment in Step3BaseAnswers (Scene aesthetic, not Brand aesthetic)

`steps/Step3BaseAnswers.tsx`, `BrandSceneWizard.tsx` (META titles)

- **Rename** "Brand aesthetic" → **"Scene aesthetic"** everywhere (META_WIZARD step 3 title, label, and Step5Review header if present).
- Subtitle copy: "Pick the kind of scene you want — we'll match the rest"
- Replace the 10 abstract presets with a **scene-first** preset list and a primary "Scene type" selector at the top:
  - **Scene type** (single-select chips, required for this step): Indoor studio · Indoor lifestyle · Outdoor location · Outdoor nature · Lifestyle moment · Architectural · Tabletop / Flat lay
  - **Aesthetic flavor** (single-select chips, optional): Quiet luxury · Raw editorial · Warm artisanal · Clean minimal · Sun-bleached · Bold graphic · Vintage film · Soft natural
  - **+ Custom** escape hatch for either group (only shows the input on click, autofocus, deselects presets).
- The remaining four fields (Mood, Lighting, Location, Framing) become **pill grids** with curated values + "+ Custom":
  - **Mood**: Calm · Energetic · Quiet · Playful · Confident · Intimate · Cinematic
  - **Lighting**: Soft window · Golden hour · Hard noon sun · Studio softbox · Overcast · Candlelit · Neon / mixed
  - **Location** is dropped here as a duplicate of Scene type (we already have it). Remove the field from this step; data still writes to `base.location` only if the user enters one via Custom on Scene type.
  - **Framing**: Wide 3/4 · Tight crop · Top-down · Eye-level · Low angle · Over-shoulder
- **Notes** stays as a Textarea — that's the legitimate free-form field.
- Internally writes the chosen preset label as the value into the existing `base.aesthetic` / `base.mood` / `base.lighting` / `base.framing` strings. Schema unchanged.

### 4. Step 1 — don't pre-select a family, drop "Available" badge, make all families clickable

`wizard/useWizardState.ts`, `wizard/steps/Step1ChooseModule.tsx`, `wizard/BrandSceneWizard.tsx`, `features/brand-scenes/constants.ts`

- `useWizardState` initial state: replace `module: "fashion"` with `module: undefined`. Update `BrandSceneAnswers` type so `module` is optional. Anywhere downstream that reads `answers.module` for auto-sub-family / META gets a guard.
- `Step1ChooseModule`: remove the `tag` prop entirely (no "Available" / "Coming soon"). Every card becomes fully clickable.
- All 12 families become enabled in the picker. For families not in `BRAND_SCENE_UNLOCKED_MODULES`, clicking still calls `onChange(m)` but the wizard's Next-button gating shows a small inline notice under the grid: **"More tailored questions for {family} ship soon — you can still build this scene from the base details."**  Selection is allowed; **Next is enabled** and Step 4 (module questions) falls back to the existing generic placeholder for that family. (`Step4ModuleQuestions` already renders a placeholder card for unimplemented families.)
- `nextDisabled` for step 1 changes from `!UNLOCKED.includes(module)` → `!answers.module`.
- Gating for Step 4 changes from "must pass module validator" to "if module has a validator, must pass it; otherwise allow Next".

### 5. Hide global StudioChat support widget inside the wizard

`pages/BrandSceneWizardPage.tsx` (or wherever `/app/brand-scenes/new` mounts — verify with rg)

- On mount: `document.body.setAttribute('data-hide-studio-chat', '1')`. On unmount: remove it.
- This piggybacks on the existing mechanism already wired in `StudioChat.tsx` (line 47-53: MutationObserver on `data-hide-studio-chat`).

### 6. Unify all pill styles — single shared `Chip` component

`wizard/components/Chip.tsx` (new), used by `Step3BaseAnswers`, `FashionQuestions`, `FootwearQuestions`, `EyewearQuestions`, and `Step2ChooseSubFamily` (the legacy pill remnants).

```tsx
<Chip active selected onClick>{label}</Chip>
```

- `rounded-full border px-4 py-2 text-sm transition-colors`
- Active: `border-foreground bg-foreground text-background`
- Idle: `border-border bg-card text-foreground hover:border-foreground/40`
- One single `size="md"` variant (drop the `sm` variant — the size inconsistency was the complaint).
- Custom-add chip variant: `border-dashed` + Plus icon, same dimensions.

Replace the duplicated `Chip` definitions currently inlined in `FashionQuestions`, `FootwearQuestions`, `EyewearQuestions` with imports of this shared component.

### Out of scope (deferred)

- Footwear / Eyewear archetype + secondary-field cleanup (mirror once Fashion approach is validated).
- Generation pipeline changes — `base` and `module_answers` keep their existing shape, just with some keys absent. Phase 7b prompt builder already treats them as optional.
- Migrating saved rows that contain `archetype` / `garment_focus` — schema keeps them optional, so reads stay safe.

### Files touched (all frontend)

- create `src/features/brand-scenes/wizard/components/Chip.tsx`
- edit `src/features/brand-scenes/wizard/useWizardState.ts`
- edit `src/features/brand-scenes/wizard/BrandSceneWizard.tsx`
- edit `src/features/brand-scenes/wizard/steps/Step1ChooseModule.tsx`
- edit `src/features/brand-scenes/wizard/steps/Step3BaseAnswers.tsx`
- edit `src/features/brand-scenes/types.ts` (make `module` optional)
- edit `src/features/brand-scenes/modules/fashion/FashionQuestions.tsx`
- edit `src/features/brand-scenes/modules/fashion/schema.ts` (relax required fields)
- edit `src/features/brand-scenes/modules/fashion/questions.ts` (add scene/vibe/setting presets)
- edit the page component that mounts `BrandSceneWizard` (add `data-hide-studio-chat` effect)
- minor updates to `Step5Review.tsx` and any tests checking the old required fields
