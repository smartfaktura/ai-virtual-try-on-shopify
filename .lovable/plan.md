# Phase 7e — Wizard polish, ordering, and inconsistencies

Fix the friction the user flagged plus a small audit of related blind spots.

## 1. Re-order steps — Cast first

New step order:

```
Source → Family → Sub-family → Cast & product → Scene aesthetic → Category details → Preview → Review
```

Why: cast determines which scene dials are even relevant (no people = hide wardrobe, gaze, body-part focus, makeup, hair, pose energy, group dynamic, hands-on-product, walking/seated angles, apparel-only camera angles, etc.). Putting cast first means Step "Scene aesthetic" never shows irrelevant blocks. The current order surfaces dead controls.

Implementation:
- Swap the indexes in `BrandSceneWizard.tsx` step switch + `META_WIZARD`.
- Renumber `STEPS_WIZARD` / `STEPS_REFERENCE` labels in `WizardLayout.tsx`.
- Re-point `nextDisabled` gates: Cast gate now applies at the new earlier index; Scene aesthetic gate is unchanged (already permissive).
- Update `useWizardState` reducer's `next/back` so the reference path still skips Step "Category details".

## 2. Hide irrelevant scene dials when cast = none

After cast is chosen, `Step3BaseAnswers` reads `answers.cast?.preset` and:

- Hides the entire "Cast styling" block (already on Step 4).
- Hides camera-angle groups that require a person: apparel angles (walking/seated/bust/hip/knee), eyewear "on-face" subset, jewelry "on-finger/on-wrist/on-neck/on-ear", footwear "on-foot" subset.
- Hides subject-focus options `person` and `equal` from the chip pool.
- Hides "Negative-space intent: reserved for headline/logo" only if `output_use_case` was the trigger — see #3.

`applicableFields` already gets `castPreset`; extend it to read a new `hideWhenNoCast?: boolean` flag on each `ExtrasField` and split the apparel/footwear/eyewear/jewelry angle pools into "with people" vs "product only" variants.

## 3. Remove dead/awkward controls

- Delete the **"Surface under product"** Section from Step 3 — already redundant with the new "Floor surface" and "Backdrop type" dials. The Zod field `base.surface` stays for back-compat but no UI writes it anymore.
- Delete the **"Output use case"** Section from Step 3 — out of scope for a creative scene wizard; output sizing is handled at generation time, not here. Field stays on the schema for back-compat.
- Delete the footer text **"Aspect ratio is locked to 4:5 (portrait) — the standard preview format."** — the lock is already enforced silently in the assembler.

## 4. Fix scroll-on-step-change

`BrandSceneWizard` calls `dispatch({type:'next'})` but the page keeps the previous scroll position, so users land mid-page on the next step.

- Add a `useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); /* scroll the wizard's nearest scroll container, not just window — find the closest `overflow-y-auto` ancestor of the wizard root and reset its scrollTop too */ }, [step])` inside `BrandSceneWizard`.
- Verify by visually checking Step 3 → Step 4 transition: the title should be at the top of the visible area.

## 5. Surface "why is Next disabled?"

Today the Next button is disabled silently and, on a long form, the user cannot even reach the missing field. Two changes:

- **Tooltip on the disabled Next button** explaining the first unmet requirement, e.g.:
  - "Pick a cast option"
  - "Pick a product interaction"
  - "Pick a product scale"
  - "Add a reference image, scene name, and intent"
  - "Answer the required category questions"

  Implementation: compute a `nextDisabledReason: string | null` next to `nextDisabled` in `BrandSceneWizard` and forward it to `WizardLayout`. Wrap the `<Button>` in the existing `Tooltip` only when disabled+reason.

- **Inline highlight + auto-scroll to the first missing required Section** when the user clicks the disabled Next anyway:
  - Replace `disabled={nextDisabled}` with `disabled={false}` + an `onClick` guard that, when invalid, scrolls the first required-and-empty Section into view and flashes a red ring on it for 1.4 s.
  - Required Sections get a `data-required` attribute and a `data-missing` toggled by the parent.

## 6. Family-picker inconsistencies

Blurbs in `Step1ChooseModule.tsx` overlap:

- `wellness: "Supplements, skincare, ritual"` mentions "skincare" but `beauty-skincare` actually lives under **Beauty & Fragrance**. Fix blurbs:
  - `wellness: "Supplements, vitamins, ritual"`
  - `"beauty-fragrance": "Skincare, makeup, perfume, atmospheric still-life"` (was just "Bottles, jars, atmospheric still-life" — undersold)
  - `home: "Furniture, decor, soft goods"` (kitchenware lives in Food / Drink, not Home)
  - `"food-drink": "Plates, drinks, kitchenware lifestyle"`
  - `tech: "Phones, audio, gadgets, accessories"`

Step 2 sub-family chips also display the raw slug-derived label when no override exists. Audit `SUB_FAMILY_LABEL_OVERRIDES` and Title-Case the user-facing labels: e.g. "skincare" → "Skincare", "supplements-wellness" already overrides to "wellness" but should be "Supplements & wellness".

## 7. Additional blind spots found in the audit

- **"Mood" free-text + "Brand voice" pills overlap** — keep pills, remove the free-text "Mood" field on Step 3 (it duplicates Brand voice + Aesthetic era).
- **"Framing" free-text + "Composition geometry" pills overlap** — keep pills, remove the Framing free-text.
- **"Lighting" free-text + "Light direction" + "Light quality" extras overlap** — remove the legacy free-text Lighting, the two new pill blocks fully replace it.
- **Step 2** auto-skips when only one sub-family exists, but never visually announces that — confusing because the URL/step counter jumps. Add a quick toast or inline "Auto-selected sole sub-family" hint on Step 3 when we skipped.
- **Step 4 Cast** doesn't make it visible that picking `none` (no people) is a first-class scene choice — give it a larger card with the copy "Just the product — no models" so users don't think the wizard requires a model.
- **`Replicate reference` cast** is currently mixed in with other cast options. Move it to its own row at the top of the cast picker with a small "Reference only" badge so it's not picked accidentally when the user just wanted "solo".
- **`Scene type` (Indoor studio, Outdoor location, etc.)** is required but its prompt impact is now duplicated by `Setting` + `Backdrop type`. Demote it to "optional headline" — required check stays only on Cast + Interaction + Scale + Reference fields.

## 8. Out of scope

- Restructuring the DB schema (`base.surface`, `base.output_use_case` stay as nullable, simply no longer written by the UI).
- Re-wiring the live generation pipeline (assembler already handles all current and new fields; the deleted UI fields are just no-ops).
- Brand-memory-fed defaults for the new step order.

## Technical

- **Edited:**
  - `wizard/BrandSceneWizard.tsx` — step order, `nextDisabledReason`, scroll-to-top effect.
  - `wizard/WizardLayout.tsx` — accept `nextDisabledReason`, render tooltip on disabled Next, "click-anyway" scroll-to-missing hook, renumber step labels.
  - `wizard/useWizardState.ts` — re-point `next/back` for the new order (cast is now Step 3, aesthetic is Step 4).
  - `wizard/steps/Step3BaseAnswers.tsx` — remove "Surface under product", "Output use case", footer aspect-ratio line, Mood / Framing / Lighting free-text fields. Pass `castPreset` into `applicableFields` and skip cast-dependent angle pools.
  - `wizard/steps/Step4Cast.tsx` — promote `none` and `replicate` presentation; nothing else.
  - `wizard/steps/Step1ChooseModule.tsx` — fix blurbs.
  - `wizard/components/Section.tsx` — add `required`/`data-required` + `data-missing` + flash-ring animation.
  - `wizard/constants/extras.ts` — add `hideWhenNoCast?: boolean`; split apparel/footwear/eyewear/jewelry angle pools into "with-cast" and "product-only" subsets; tag the with-cast ones.
  - `lib/onboardingTaxonomy.ts` — Title-Case sub-family overrides.

- **Tests:**
  - `wizard-order.test.ts` — given step 3 (cast none) → step 4 (aesthetic) hides person-dependent extras.
  - `next-disabled-reason.test.ts` — each gate returns the correct human-readable reason.
  - `taxonomy-labels.test.ts` — no sub-family slug renders as bare slug; all labels are Title Case.
  - Existing 89 tests remain green.
