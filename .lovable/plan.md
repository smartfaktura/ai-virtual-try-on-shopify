# Phase 7f — Smart, Conditional Wizard

Goal: stop dumping 100+ pills at the user. Pick **Cast → Scene Type → Setting** first, then reveal only the dials that matter, with **dependent fields** that auto-prefill sensible values (e.g. "Two-tone hard split" backdrop → instantly show two color pickers prefilled from the palette anchor). Setting pools become **category × sub-family aware** (swimwear → beach/pool/villa/jungle; jackets → city/forest/snow, not beach). Allow exotic combos like "rain in studio".

---

## 1. New flow inside the Aesthetic step

Current: one long scrolling step with every dial.
New: a **3-stage progressive form** inside Step 4 (Aesthetic):

```text
Stage A — Scene type        (1 choice, 6 cards: Studio / Indoor lifestyle /
                             Outdoor location / Outdoor nature / Architectural /
                             Tabletop & flat-lay)
   ↓ reveals
Stage B — Setting / sub-environment
   pool filtered by  module × sub_family × scene_type
   e.g. swimwear + Outdoor location  → Beach, Hotel pool deck, Yacht,
                                       Modern villa, Jungle pool, Rooftop pool
        jackets + Outdoor location   → City street, Forest trail, Snowy alley,
                                       Mountain pass, Industrial loft exterior
   ↓ reveals
Stage C — Contextual dials only (lighting, props, weather, backdrop, ...).
   Each dial declares `appliesWhen({ scene_type, setting, module, sub_family, cast })`
   and is hidden otherwise.
```

Each completed stage collapses into a compact summary chip the user can click to edit. No stage shows more than ~12 chips at once; an inline "Show more" reveals the global pool as today.

---

## 2. Rule engine for dependent fields

New module `wizard/rules/sceneRules.ts` exporting a declarative table:

```ts
type RuleCtx = {
  module?: BrandSceneModule;
  sub_family?: string;
  scene_type?: SceneType;
  setting?: string;
  cast?: CastPreset;
  values: Record<string, string | undefined>;   // current extras
};

type FieldRule = {
  key: string;                       // extras key the field writes
  appliesWhen?: (c: RuleCtx) => boolean;
  /** When this field gets a value, seed/clear other fields. */
  cascade?: (value: string, c: RuleCtx) => Partial<Record<string, string|undefined>>;
  /** Reveal extra child fields once a specific value is picked. */
  childrenWhen?: (value: string) => string[];
};
```

Examples:
- `backdrop_type = "Two-tone hard split"` → cascades `backdrop_color_a`, `backdrop_color_b` to two complementary swatches drawn from the chosen `palette_preset` (or default dusty-rose + cocoa). Reveals two color-picker fields.
- `backdrop_type = "Soft gradient wall"` → reveals `gradient_direction` (chips: top→bottom, left→right, radial) + `gradient_stops` (auto from palette).
- `scene_type = "Indoor studio"` + `weather = "Rain"` → unlocks `studio_fx` field with presets `Practical rain rig`, `Water mist`, `Wet-look spray`, `Reflective wet floor`, plus auto-sets `shadows = "wet"`.
- `setting = "Beach"` → cascades `light_direction = "Backlit golden hour"`, `motion = "Wind in hair"`, hides `backdrop_type` (outdoor).
- `cast = none` → hides `pose_energy`, `gaze`, `hair`, `makeup`, body-part angles (already partly in place; rules engine unifies it).
- `aesthetic_era = "Brutalist"` → cascades `realism = "documentary"`, `saturation = "desaturated"` unless user has overridden.

Cascades only fire when the target field is empty or marked `auto`, never overwriting user picks. Every auto-filled field shows a tiny "✦ auto" badge and a one-click "clear" affordance.

---

## 3. Category × sub-family setting pools

Replace the single `SCENE_SETTINGS` list with `wizard/registry/settingsBySubfamily.ts`:

```ts
SETTINGS_BY_SUBFAMILY: Record<string /* `${module}/${sub_family}` */, {
  [scene_type: string]: string[];      // ordered pool
}>
```

Seed entries (excerpt):
- `fashion/swimwear` → outdoor_location: Beach, Hotel pool deck, Yacht, Modern villa pool, Jungle pool, Rooftop pool, Salt flats, Cliff edge; outdoor_nature: Ocean shoreline, Tropical lagoon, Desert oasis.
- `fashion/jackets` → outdoor_location: City street, Old town alley, Industrial loft exterior, Mountain pass; outdoor_nature: Forest trail, Snowy alley, Foggy moor; indoor_lifestyle: Loft, Atelier, Diner.
- `fashion/dresses` → architectural lobby, Gallery, Rooftop terrace, Ballroom, Garden.
- `footwear/sneakers` → Skate plaza, Subway platform, Court, Rooftop, Warehouse.
- `eyewear/sunglasses` → Beach boardwalk, Marina, Convertible interior, Rooftop pool.
- `beauty/fragrance` → Marble vanity, Sunlit windowsill, Velvet drape, Wet glass, Garden bench.
- `home/tabletop` → Linen-set table, Kitchen counter, Outdoor terrace, Studio plinth.

Fallback chain: `module/sub_family` → `module/*` → global pool. Anything missing degrades gracefully so we don't block new sub-families.

Same registry-driven approach is extended to `BACKDROP_TYPES`, `FLOOR_TYPES`, `MOTION`, `CAMERA_ANGLES`, `LIGHT_DIRECTIONS`. Each pool can be tagged `{ indoor?: bool, outdoor?: bool, needsCast?: bool, family?: string[] }` so the rule engine filters them on the fly.

---

## 4. Dependent UI primitives

New components under `wizard/components/`:
- `ConditionalField.tsx` — wraps a Section, hides itself when `appliesWhen` returns false, plays a 120 ms fade-in when it appears.
- `AutoFillBadge.tsx` — tiny ✦ pill rendered next to auto-cascaded values, with a "use my own" click target.
- `DualColorPicker.tsx` — used by two-tone backdrops and gradient stops; seeded from `palette_preset`.
- `SmartSettingCard.tsx` — large image-less cards used in Stage B with the contextual setting names (Beach, Villa, Jungle, …) and a one-line vibe note.

`ExtrasPillField` is updated to accept an optional `children` slot rendered after the chip row, so a backdrop type can immediately reveal its color-pickers in-place.

---

## 5. State, schema, assembler

- `useWizardState.ts`: add `scene_type` and `setting_subtype` to `base`, and add a `auto: Record<string, true>` flag map so we know which values were cascaded vs. user-chosen.
- `schema.ts`: extend `brandSceneBaseAnswersSchema` with `scene_type` (enum) and keep `extras` open. Add validation: certain combos are blocked (`scene_type = Tabletop` + `cast = solo` → error "Tabletop scenes have no people; switch cast first").
- `assembleSceneDirective.ts`: render the new keys in canonical order (Scene type → Setting → Backdrop {colors A/B if present} → Light → Motion → FX → Composition). Unknown keys continue to render as `Style (key): value.`

---

## 6. Authoring & extensibility

- All pools and rules live in plain TS tables (`registry/` + `rules/`) — no JSX changes needed to add new sub-family scenes.
- A new dev-only `/dev/wizard-rules` page (admin) lists every rule and lets us test `RuleCtx` snapshots, so adding "swimwear → jungle pool" is one PR.

---

## 7. Tests (Vitest, additive)

- `scene-rules.test.ts` — Two-tone hard split seeds color A/B from palette; clearing backdrop clears children; rain + indoor studio unlocks `studio_fx` and sets `shadows = wet`.
- `setting-pools.test.ts` — swimwear outdoor pool excludes "snowy alley"; jackets outdoor pool excludes "beach"; missing sub-family falls back to module pool.
- `progressive-flow.test.ts` — Stage B is hidden until `scene_type` chosen; Stage C is hidden until `setting` chosen; cast-none hides person-only dials.
- `assembler-rules.test.ts` — Cascaded values render with their friendly prefixes; auto-fill clearing removes them from the prompt.

Existing 90 tests stay green.

---

## 8. Files touched / created

Created:
- `src/features/brand-scenes/wizard/rules/sceneRules.ts`
- `src/features/brand-scenes/wizard/registry/settingsBySubfamily.ts`
- `src/features/brand-scenes/wizard/components/ConditionalField.tsx`
- `src/features/brand-scenes/wizard/components/AutoFillBadge.tsx`
- `src/features/brand-scenes/wizard/components/DualColorPicker.tsx`
- `src/features/brand-scenes/wizard/components/SmartSettingCard.tsx`
- `src/features/brand-scenes/__tests__/scene-rules.test.ts`
- `src/features/brand-scenes/__tests__/setting-pools.test.ts`
- `src/features/brand-scenes/__tests__/progressive-flow.test.ts`
- `src/features/brand-scenes/__tests__/assembler-rules.test.ts`

Edited:
- `src/features/brand-scenes/wizard/steps/Step3BaseAnswers.tsx` (3-stage progressive layout)
- `src/features/brand-scenes/wizard/components/ExtrasPillField.tsx` (children slot, auto badge)
- `src/features/brand-scenes/wizard/constants/extras.ts` (rule hooks, tagged pools)
- `src/features/brand-scenes/wizard/useWizardState.ts` (scene_type, auto map)
- `src/features/brand-scenes/schema.ts` & `types.ts` (scene_type enum, combo validation)
- `src/features/brand-scenes/prompt/assembleSceneDirective.ts` (new keys + canonical order)

No backend or DB changes. Aspect ratio lock and step order (Cast → Aesthetic → Category → Preview → Review) from Phase 7e are preserved.
