## Phase 7j — Wizard polish pass

Audit of the wizard after the recent Phase 7i changes surfaces a handful of regressions and rough edges. None of them changes assembled prompt semantics — all are UI-clarity, dedupe, and scoping fixes.

### Issues found

1. **Ethnicity renders twice (again).** Step4Cast renders `<EthnicityChips>` inside a dedicated Section AND the field is still in `CAST_EXTRAS_FIELDS` (key `ethnicity`, `customRender: "ethnicity"`). The `applicableFields(...).map` loop below has no filter for `customRender`, so it renders a second generic chip row with the raw `ETHNICITY_HINT` presets. Exactly the bug the last phase was supposed to kill.

2. **Storytelling moments aren't actually per-subfamily.** `getStorytellingMoments(subFamily)` was added in `registry/storytellingBySubfamily.ts`, but Step4Cast still feeds the field through `ExtrasPillField` using the field's default `presets: STORYTELLING_MOMENT` (the generic list). The user-facing fix is unreached.

3. **Swim/lingerie fields appear for `hands` cast.** `swim_styling` and `wetness` set `castOnly: ["solo","two","group","hands"]`. Disembodied hands shouldn't get swimwear styling pills. Restrict to `solo/two/group`.

4. **Generic camera angles list is bloated with product-only shots.** `CAMERA_ANGLES_GENERAL` contains "Pour shot / Splash shot / Steam shot / Floating product / Top-down 90°" mixed with regular human angles. These should only appear when no person is in frame (cast `none` / `hands`) or when scene context calls for them — otherwise they confuse on-body picks.

5. **Stage C "More creative dials" is a 20+ field dump.** Hard to scan, no grouping. Group into 4 collapsible blocks (Backdrop & floor, Light & time, Camera, Composition & crop). Default first block open.

6. **Step title doesn't carry the sub-family.** META titles say "Scene aesthetic" / "Cast & product interaction" generically. Append the chosen sub-family label (e.g. "Cast & product interaction · Hoodies") so the user sees the wizard is tuned.

7. **Unused imports.** `Step4Cast.tsx` imports `DIVERSITY_OPTIONS, type Diversity` from `sceneExtras` — never referenced.

8. **`Floor` field shows for outdoor scenes** where it is implied (beach → sand, mountain → rock). Scope `floor` to indoor scene types like the backdrop fields already do.

9. **Stage A/B scene-type and setting buttons jump-scroll on tap.** When `SceneTypePicker` re-renders the Stage B pool, the page can shift the user's view down because Stage B grows in place. Add `scroll-margin-top` on Stage B's `<Section>` and don't autoFocus anything inside it.

10. **Wardrobe color rule restated**: confirm `subFamily !== "swimwear" && subFamily !== "lingerie"` guard is still correct after rename — yes, keep.

### Implementation

**`src/features/brand-scenes/wizard/constants/extras.ts`**
- Remove the `ethnicity` entry from `CAST_EXTRAS_FIELDS` entirely (Step4Cast renders the bespoke `EthnicityChips` directly). Drop the `customRender` field from the type as no other field uses it.
- `swim_styling` / `wetness` / `lingerie_layer`: `castOnly: ["solo","two","group"]`.
- Split `CAMERA_ANGLES_GENERAL` into `CAMERA_ANGLES_HUMAN` (eye-level / ¾ / profile / back / low / high / Dutch) and keep product-only shots in a new `CAMERA_ANGLES_PRODUCT`. The single `camera_angle` field uses `CAMERA_ANGLES_HUMAN` when cast has people, `CAMERA_ANGLES_PRODUCT` when cast is `none` / `hands`. Implement via `presets` resolved at render time inside `ExtrasPillField` (pass a `presetsResolver?: (ctx) => string[]` on `ExtrasField`, fallback to `presets`).
- Scope `floor` with `appliesWhen: (c) => isIndoor(c.scene_type)`.

**`src/features/brand-scenes/wizard/registry/storytellingBySubfamily.ts`** — no change; already shipped.

**`src/features/brand-scenes/wizard/steps/Step4Cast.tsx`**
- Drop unused `DIVERSITY_OPTIONS`, `Diversity` imports.
- After computing the applicable cast fields, override the `storytelling_moment` field's `presets` with `getStorytellingMoments(module, subFamily)` before passing to `ExtrasPillField`. Use `hasExplicitMoments` to hide the field entirely when there are no relevant moments AND cast is `hands` (avoid generic-only noise).
- No need for the `customRender` branch — the field is gone.

**`src/features/brand-scenes/wizard/steps/Step3BaseAnswers.tsx`**
- Wrap Stage C children in 4 `StageCGroup` collapsibles. New component `components/StageCGroup.tsx` — pure presentational, props `{label, defaultOpen, children}`. Field-to-group routing lives in a small map keyed by `field.key`.
- Add `scroll-mt-24` to Stage B Section (prevent auto-jump under sticky header).

**`src/features/brand-scenes/wizard/components/ExtrasPillField.tsx`**
- Support optional `field.presetsResolver` for runtime preset selection. Falls back to `field.presets`.

**`src/features/brand-scenes/wizard/BrandSceneWizard.tsx`**
- Compute sub-family label from `SUB_TYPES_BY_FAMILY` and append `· {label}` to the title for steps 3, 4, 5.

**`src/features/brand-scenes/wizard/components/StageCGroup.tsx`** (new)
- Collapsible block: dark uppercase label row + chevron, body uses `Section` children verbatim.

### Tests

- Update `setting-pools-coverage.test.ts` only if camera angle split breaks any imports — it shouldn't.
- New `__tests__/storytelling-per-subfamily.test.ts`: assert Step4Cast passes the right preset list for `fashion/hoodies` and falls back to generic for unmapped subfamily.
- New `__tests__/cast-extras-no-duplicate-ethnicity.test.ts`: `applicableFields(CAST_EXTRAS_FIELDS, ...)` never contains `key === 'ethnicity'`.

### Out of scope

- Quick-starter scenes, "Apply all 3 recommendations" button, per-field "Why?" tooltips, reset-per-stage — keep for a later phase.
- No prompt assembler changes; storytelling/ethnicity strings already flow through verbatim.
