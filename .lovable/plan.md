# Phase 7d — Versatile Brand Scene Wizard

Goal: turn the wizard into a power-user tool. Every pill block grows 3-5× in options, gets category/sub-category-aware filtering, and accepts a free-text "Custom…" entry. Fill the blind spots we left for apparel, footwear, eyewear, jewelry, fragrance, beauty, home, tech, food, wellness.

## 1. Background / Backdrop library (NEW, Step 3)

Single new block "Backdrop & floor" with three sub-axes that combine:

- **Backdrop type** — Solid color, Gradient, Seamless paper, Cyclorama, Brick wall, Concrete wall, Plaster wall, Tile wall, Wood paneling, Marble slab, Stone slab, Drape (linen/velvet/silk), Mesh / scrim, Glass / acrylic, Mirror, Industrial corrugated, Painted texture, Outdoor (sky / horizon / foliage / asphalt / sand / water).
- **Floor / surface** — Concrete, Polished stone, Marble, Terrazzo, Raw wood, Parquet, Sand, Pebble, Grass, Tile, Rug, Glass, Water, Reflective acrylic, Painted floor, Asphalt, Cobblestone, None (floating).
- **Backdrop color/gradient** — preset swatches (warm white, cool white, ivory, putty, sage, terracotta, cobalt, oxblood, charcoal, black) + "Custom hex" + gradient direction picker (linear / radial, 2-stop).

Floor pool is filtered by `setting` (Architectural interior hides Grass/Sand, Beach hides Parquet, etc.).

## 2. Camera angle expansion (apparel / footwear / eyewear)

Replace today's lens-only control with a two-axis camera block:

- **Lens** (kept) — 24 / 35 / 50 / 85 / 135 / Macro.
- **Camera angle** — 100+ presets, exposed in groups so the user is not overwhelmed:
  - *Eye level* — straight on, ¾ left, ¾ right, profile L, profile R, back, ¾ back L, ¾ back R.
  - *Low* — worm's eye, low ¾, low profile, low back, low hero.
  - *High* — overhead flat-lay, top-down 45°, high ¾, high profile.
  - *Dutch / tilt* — slight 5°, strong 15°, vertical roll.
  - *Movement* — walking toward, walking away, mid-stride side, jumping, sitting, leaning, crouching, reclined.
  - *Apparel-specific* — full-length front, full-length back, half-body, bust crop, hip crop, knee crop, ankle crop, detail crop (collar, cuff, hem, pocket, button, zip, seam, label, lining).
  - *Footwear-specific* — top-down pair, single shoe ¾, sole-up, heel-back, tongue close, lace detail, side profile pair, on-foot walking, on-foot seated, on-foot stairs, kicked-off arrangement.
  - *Eyewear-specific* — front on-face, ¾ on-face, profile on-face, top-down folded, top-down open, lens detail, temple detail, bridge detail, on-hair, in-hand.
  - *Jewelry-specific* — macro stone, macro clasp, on-finger, on-wrist, on-neck, on-ear, paired on tray, in-hand offering.

Each preset carries its own prompt directive. Category determines which group appears; "Show all angles" reveals everything.

## 3. Category / sub-category-aware pools

Single source of truth: `categoryPresets.ts` keyed by `family` with optional `sub_family`. Resolution: `sub_family` → `family` → global default. Tuned bundles:

- **Apparel** (tops / bottoms / dresses / outerwear / knitwear / activewear / swim / loungewear) — full camera-angle and gesture pools, all wardrobe colors, all backdrops.
- **Footwear** (sneakers / boots / heels / loafers / sandals) — footwear angles, surface bias (asphalt, polished stone, sand for sandals only).
- **Eyewear** (sunglasses / optical) — eyewear angles, no "wearing on feet" gestures.
- **Jewelry** (rings / necklaces / earrings / bracelets / watches) — macro lenses default, pocket/handheld scale only, jewelry gestures.
- **Fragrance / Beauty** — pocket/handheld scale, no "wearing" interaction, splash / pour / smoke surface options unlocked.
- **Home / Furniture** — architectural/furniture scale only, no human "wearing", room-set backdrops.
- **Tech / Gadgets** — handheld scale, macro + standard lenses, clean cyclorama backdrop default.
- **Food / Beverage** — overhead + 45° angles, surface bias to wood/marble/linen, pour/steam shadow.
- **Wellness / Supplements** — pocket/handheld, soft palette default.

Settings that don't apply are pruned from the menu (e.g. jewelry never sees "Vehicle").

## 4. Custom-input everywhere

Every pill block gains a trailing "+ Custom…" pill that opens a small inline input and stores the raw string as a directive. Applies to: setting, weather, season, lens, camera angle, depth of field, palette, finish, surface, backdrop type, backdrop color, wardrobe color, body part focus, gaze, hands-on-product gesture, group dynamic, era, brand voice, output use case.

## 5. Blind-spot dials (NEW)

- **Time of day** — golden hour, blue hour, midday, overcast noon, night, studio (no time).
- **Light direction** — front, ¾, side rim, back-lit, top, bottom, ring.
- **Light quality** — soft box, hard sun, dappled, neon, candle, mixed practical.
- **Motion / energy** — still, breeze, fabric in motion, jump freeze, long exposure trail.
- **Skin finish** (only with cast) — natural, dewy, matte, glossy editorial.
- **Hair styling** (only with cast) — natural, wet-look, slicked, tousled, braided, updo, covered.
- **Makeup** (only with cast) — bare, no-makeup makeup, editorial, graphic liner, glossy lip, bold lip.
- **Pose energy** — relaxed, powerful, candid, dynamic, contemplative, playful.
- **Sub-cast detail** — age band (18-25 / 25-35 / 35-50 / 50+ / mixed), build (slim / athletic / curvy / plus / mixed), height bias.
- **Storytelling moment** — arriving, departing, mid-action, resting, ritual (apply, pour, lace, fasten).
- **Crop safety** — title-safe top, bottom, left, right (for paid ad placements).

All of these accept a Custom… entry and most are category-aware.

## 6. Combo guards (carried over from 7c)

`combinationGuards.ts` blocks impossible pairs at the UI and Zod layer:

- `none` cast + wearing/holding/using.
- `hands` cast + wearing.
- Architectural / furniture scale + wearing.
- Fragrance / beauty / jewelry + wearing-on-body when no body part is selected.
- `night` time + `clear` weather → auto-rewrites to "moonlit clear".
- `macro` lens + `solo/two/group` cast → warns the macro won't capture the body.

## 7. Prompt assembler

`assembleSceneDirective.ts` extended to render the new fields in canonical order:

```text
SCENE
  setting → backdrop → floor → backdrop-color → weather → season → time-of-day
  lens → camera-angle → DOF → light-direction → light-quality → motion
  palette → finish → surface → era → realism → brand-voice → use-case
  composition → neg-space-intent → subject-focus

CAST
  cast-preset → interaction → wardrobe-color → body-part-focus → gaze →
  group-dynamic → diversity → age-band → build → pose-energy →
  skin-finish → hair → makeup → hands-on-product → storytelling-moment

PRODUCT
  scale → cast-vs-product relationship

GUARDRAILS
  4:5 portrait (locked) → negative note → crop-safe zones
```

Custom strings are appended verbatim with a `[user-custom]` marker so they survive prompt normalization.

## 8. UI

- Each block collapses to its top 6 pills by default with a "Show all (N)" link.
- Category-tuned defaults are pre-applied only when the user hasn't touched the section.
- Step 5 Review summary chips are grouped (Scene / Light / Cast / Product / Output) so the wall of dials stays readable.

## 9. Out of scope

- Persisting "Show all" preference.
- New aesthetic memory docs.
- Pipeline wiring beyond the assembler — Visual Studio consumes the existing directive string.

## Technical

- New: `wizard/constants/backdrop.ts`, `wizard/constants/cameraAngles.ts`, `wizard/constants/lighting.ts`, `wizard/constants/styling.ts`, `wizard/constants/categoryPresets.ts`, `wizard/constants/combinationGuards.ts`, `wizard/components/CustomPillInput.tsx`, `wizard/components/ChipGroup.tsx` (handles "Show all" + custom).
- Edited: `Step3BaseAnswers.tsx`, `Step4Cast.tsx`, `Step5Review.tsx`, `useWizardState.ts`, `types.ts`, `schema.ts`, `prompt/assembleSceneDirective.ts`, `prompt/buildCastDirective.ts`, `prompt/buildScaleDirective.ts`.
- Tests: `backdrop-directive.test.ts`, `camera-angle-pools.test.ts`, `combo-guards.test.ts`, `custom-pill.test.ts`, `category-presets.test.ts`, plus updates to existing assembler tests.
- 4:5 lock and all current behaviour preserved.
