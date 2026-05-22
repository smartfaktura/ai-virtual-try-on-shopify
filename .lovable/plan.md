# Wizard upgrade — category-aware presets, combo guards, more dials

The wizard today treats every pill list as a global menu. Two problems flow from that:

1. Users can build nonsense scenes (cast = "No people — product hero" + interaction = "Holding").
2. The same scale / lens / setting menu is shown for a 4 mm ring and a 2 m sofa, which is useless.

This plan fixes both and adds the dials the wizard is still missing for real production-grade scenes.

## 1. Catalog of illogical combos to forbid

These are gated at the UI layer (option hidden or disabled with tooltip) **and** in the Zod schema, so the prompt never receives an impossible pairing.

### Cast × Interaction

| Cast | Forbidden interactions | Reason |
|---|---|---|
| `none` (product hero) | wearing, holding, using, beside-with-person | No people exist in the frame |
| `none` | only `hero` is valid | Product is the sole subject |
| `hands` (hands only) | wearing | Face/body required to "wear" most items |
| `replicate` (reference) | all interactions | Reference dictates the relationship |
| any with people | `hero` | Hero means product-only |

### Interaction × Family

Already partially gated by `interactionsForFamily()`. Extend with:

| Family | Forbidden | Notes |
|---|---|---|
| fragrance / beauty / skincare | wearing | You don't "wear" perfume; use holding/beside |
| home / furniture / tech-large | wearing, holding (when scale ≥ furniture) | Scale-gated |
| food & drink | wearing | Reserved for edible-themed garments only |
| jewelry / watches / eyewear | using | Reserved for tech/wellness |

### Scale × Interaction

| Scale | Forbidden interactions |
|---|---|
| `architectural` (>200 cm) | holding, wearing |
| `furniture` (80–200 cm) | wearing; holding requires explicit confirm |
| `pocket` ≤15 cm | (no restriction, all allowed) |

### Scale × Cast

| Scale | Forbidden cast |
|---|---|
| `architectural` | `hands` (out of scale) |
| `pocket` jewelry/eyewear | `group` (4+ people don't fit a ring shot) |

### Wardrobe color × Cast

- `wardrobe_color` only valid when `cast.preset ∈ {solo, two, group}`. Already enforced; documented for completeness.

### Other cross-field guards

- `time_of_day = night` + `weather = clear` → silently allowed but assembler emits "night-clear (moonlit / artificial light)".
- `lens = macro` + `cast ∈ {solo, two, group}` → warn that macro will not capture full body; suggest swap to `hands` or `none`.
- `season = winter` + `setting = Beach / water` → warn (allowed for editorial, but flagged).

### Implementation

- New `src/features/brand-scenes/wizard/rules/combinationGuards.ts` exports:
  - `forbiddenInteractions(cast, family, scale): Set<CastInteraction>`
  - `forbiddenCastPresets(scale, family): Set<CastPreset>`
  - `warnings(answers): Array<{ field, message, severity }>`  ← soft, non-blocking
- `Step4Cast.tsx` consumes these to **hide** options outright when forbidden (cleaner than disabling) and renders warnings inline under each affected block.
- Schema (`schema.ts`) adds `.refine()` calls mirroring every hard rule.

## 2. Category-aware presets (the big one)

Each pill section now reads its options from a single registry keyed by **family** with optional **sub-family** override. Falls back to a "default" list when a family hasn't been specialised.

### New file: `src/features/brand-scenes/wizard/registry/categoryPresets.ts`

```ts
type FamilyKey = BrandSceneModule;
type SubKey = string; // sub_family slug

interface PresetBundle {
  scale?: ScalePreset[];           // ordered, first = default
  settings?: string[];             // overrides SCENE_SETTINGS
  lighting?: string[];             // overrides LIGHTINGS
  lens?: SceneLens[];              // recommended subset
  depth_of_field?: SceneDepthOfField[];
  framings?: string[];
  moods?: string[];
  palette_presets?: ScenePalette[];
  finishes?: SceneFinish[];
  interactions?: CastInteraction[]; // sharper than interactionsForFamily()
  wardrobe_colors?: WardrobeColor[];
  cast_presets?: CastPreset[];     // e.g. furniture defaults to "none"
  default_scale?: ScalePreset;
  default_cast?: CastPreset;
}

const PRESETS: Record<FamilyKey, PresetBundle & {
  sub?: Record<SubKey, Partial<PresetBundle>>;
}>;
```

Resolution order (most → least specific):
1. `PRESETS[family].sub[sub_family]`
2. `PRESETS[family]` (family-level)
3. Global defaults (current behaviour)

### Examples of curated bundles

| Family / sub-family | Scale | Lens | DoF | Cast default | Notes |
|---|---|---|---|---|---|
| `jewelry / rings` | pocket only (≤5 cm hint) | macro, portrait | extreme, shallow | hands | No "wearing on body" — gestures only |
| `jewelry / necklaces` | pocket | portrait, tele | shallow | solo | Wearing valid |
| `eyewear` | pocket | portrait, standard | shallow, balanced | solo | Hands forbidden (face needed) |
| `watches` | pocket | macro, portrait, tele | extreme, shallow | hands, solo | Same as jewelry but wrist-only |
| `fashion / dresses` | on_body | portrait, standard, tele | shallow, balanced | solo | Wearing default |
| `fashion / activewear` | on_body | standard, tele | balanced | solo | Motion-heavy actions surfaced first |
| `footwear / sneakers` | on_body, handheld | standard, tele, macro | shallow, balanced | solo, hands, none | All three archetypes valid |
| `footwear / high-heels` | on_body, handheld | portrait, tele | shallow | solo, hands | Editorial-leaning |
| `bags / backpacks` | carry | standard, tele | balanced | solo | Wearing valid, hero valid |
| `bags / wallets` | pocket, handheld | macro, portrait | shallow | hands, none | No wearing |
| `beauty / fragrance` | pocket | macro, portrait | extreme, shallow | none, hands | Wearing forbidden |
| `beauty / skincare` | pocket | macro, portrait | shallow | hands, none | |
| `beauty / makeup` | pocket | macro, portrait | shallow | hands, solo | Solo allowed (on-face application) |
| `home / furniture` | furniture, architectural | wide, standard | deep, balanced | none, solo (for scale) | Holding/wearing forbidden |
| `home / decor` | handheld, carry, furniture | standard, portrait | balanced | none, hands | |
| `tech / devices` | pocket, handheld | macro, standard | shallow, balanced | hands, solo, none | Using valid |
| `food-drink / beverages` | handheld | macro, standard, portrait | shallow | hands, none, solo | Using/holding valid |
| `food-drink / food` | tabletop scale | macro, standard | shallow | none, hands | |
| `wellness / supplements` | pocket, handheld | macro, portrait | shallow | hands, none | |

Setting menus are also pruned: jewelry never gets "Vehicle / transit", furniture always gets "Architectural interior" first, tech gets "Studio cyclorama" first.

### UI behaviour

- When the user lands on Step 3 or Step 4, the visible pills are the resolved bundle.
- A small text link **"Show all options"** under each section reveals the global list for power users (stored as `power_mode` boolean per section, not persisted across sessions).
- Defaults are pre-applied only when the user has not yet touched that section.

## 3. New dials for versatility

Added to Step 3 (Scene aesthetic) unless noted:

- **Subject focus** — pill: `Product is hero`, `Person is hero`, `Equal weight`, `Environment is hero`. Drives composition and DoF emphasis. Solves the ambiguity behind "what is the photo about?".
- **Surface / material under product** (sub-block, only when `cast ∈ {none, hands}` or `interaction = beside`): `Concrete`, `Linen drape`, `Polished stone`, `Raw wood`, `Glass`, `Sand`, `Water`, `Paper`, `Velvet`. Category-aware (jewelry never gets "Sand").
- **Prop density** — slider 0–4: `None`, `Minimal`, `Considered`, `Rich`, `Maximalist`. Category-aware ceiling (jewelry caps at 2, fashion lifestyle caps at 4).
- **Color contrast** — pill: `Tonal / monochrome`, `Soft contrast`, `Bold contrast`, `Complementary clash`. Pairs with palette anchor.
- **Saturation** — pill: `Desaturated`, `Natural`, `Vivid`.
- **Reflections / shadows** — pill: `Hard shadow`, `Soft shadow`, `No shadow / floating`, `Mirror reflection`, `Wet reflection`.
- **Composition geometry** — pill: `Rule of thirds`, `Centered`, `Symmetry`, `Negative space left`, `Negative space right`, `Negative space top`. Critical for thumbnails and ad placements.
- **Negative space intent** — `Reserved for headline`, `Reserved for logo`, `None`. Marketing-aware; emits a layout hint.
- **Aesthetic era** — pill: `Contemporary`, `90s editorial`, `Y2K`, `70s film`, `Brutalist`, `Quiet luxury`, `Maximalist 2020s`.
- **Realism level** — pill: `Photorealistic`, `Editorial high-fashion`, `Documentary`, `Stylised render`, `Surreal`.
- **Brand voice tone** — pill: `Premium quiet`, `Energetic`, `Playful`, `Technical`, `Romantic`, `Bold rebel`. Drives copy-equivalent micro-styling.
- **Output use case** — pill: `Website hero`, `Social square crop sibling`, `Lookbook page`, `Paid ad`, `Editorial print`. Only used to inject layout/safe-area hints; aspect stays 4:5.

Added to Step 4 (Cast):

- **Skin/age diversity** — pill: `As-cast`, `Diverse cast`. (Sensitive — kept minimal per existing memory.)
- **Hands-on-product** — pill (only when `cast.preset !== none` and product is `pocket`/`handheld`): `Both hands cradling`, `Fingertip pinch`, `Pinching cap`, `Pouring`, `Wrist showing watch`, etc. Category-aware list.
- **Body part focus** — pill: `Face`, `Hands`, `Wrist`, `Neck`, `Feet`, `Full body`, `Detail crop`. Resolves which body part the frame should center.
- **Gaze direction** — pill: `To camera`, `Away`, `Down at product`, `Closed eyes`.
- **Group dynamic** — pill (only when `cast.preset ∈ {two, group}`): `Independent`, `Interacting`, `Mirrored`, `Lined up`.

## 4. Default behaviour & power-user escape hatch

- All new fields are optional in the schema (JSONB-safe).
- Each section renders **only the relevant pills for the resolved family + sub-family**.
- **"Show all options"** link under each block reveals the full global list for power users — never modifies what we save, just expands selectable values.
- A small inline summary chip "Category-tuned: jewelry / rings" appears at the top of Step 3 and Step 4 so the user knows why their menu is smaller than someone else's.

## 5. Prompt assembler updates

`assembleSceneDirective.ts` extended in canonical order:

```text
SCENE TYPE
SETTING (+ surface)
WEATHER / SEASON / TIME OF DAY
MOOD / BRAND VOICE / AESTHETIC ERA / REALISM
LIGHTING (+ reflections/shadows)
CAMERA (lens) + DEPTH OF FIELD
FRAMING + COMPOSITION GEOMETRY + NEGATIVE SPACE intent
ASPECT RATIO: 4:5 (locked)
COLOR PALETTE + CONTRAST + SATURATION + FINISH
SUBJECT FOCUS
CAST (+ wardrobe color, body-part focus, gaze, group dynamic)
PRODUCT SCALE (+ cast-vs-product sentence)
PROP DENSITY
OUTPUT USE CASE layout hint
REFERENCE INTENT (if any)
NOTES
AVOID
```

## 6. Out of scope (separate PRs)

- Wiring the directive bundle into live `product-images` / `catalog` generation pipelines.
- Persisting "Show all options" preference across sessions.
- Brand-memory-fed defaults (e.g. read brand palette from settings and pre-select it).
- New aesthetic memory documents per sub-family (only menu pruning here).

## 7. Files

**New**
- `src/features/brand-scenes/wizard/registry/categoryPresets.ts` — single source of truth for per-family / per-sub-family pill bundles.
- `src/features/brand-scenes/wizard/registry/resolvePresets.ts` — resolution helper with the family > sub > default cascade.
- `src/features/brand-scenes/wizard/rules/combinationGuards.ts` — hard + soft combo rules.
- `src/features/brand-scenes/wizard/constants/sceneExtras.ts` — new dial constants (surface, prop density, contrast, saturation, shadows, composition, era, realism, brand voice, output use case, body-part focus, gaze, group dynamic, hands-on-product).
- `src/features/brand-scenes/__tests__/combination-guards.test.ts`
- `src/features/brand-scenes/__tests__/category-presets.test.ts`
- `src/features/brand-scenes/__tests__/scene-dials.test.ts`

**Edited**
- `src/features/brand-scenes/wizard/steps/Step3BaseAnswers.tsx` — consume resolved presets, add new dial blocks, "Show all options" link.
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` — resolved interactions/cast presets, new dial blocks, render combo warnings.
- `src/features/brand-scenes/wizard/steps/Step5Review.tsx` — summarise new fields.
- `src/features/brand-scenes/wizard/useWizardState.ts` — setters for new dials.
- `src/features/brand-scenes/types.ts` & `schema.ts` — optional new fields + `.refine()` for forbidden combos.
- `src/features/brand-scenes/prompt/assembleSceneDirective.ts` — render new fields in canonical order.
- `src/features/brand-scenes/prompt/buildCastDirective.ts` — body-part focus, gaze, group dynamic, hands-on-product.
- `src/features/brand-scenes/wizard/constants/cast.ts` — extend `interactionsForFamily` callers to also consult scale.
- `src/features/brand-scenes/wizard/constants/scale.ts` — keep, but `defaultScaleForFamily` now defers to registry when present.
