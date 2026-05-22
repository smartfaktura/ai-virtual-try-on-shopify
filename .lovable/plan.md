# Phase 7s — Quick/Detailed quiz mode + Step 5 dedup

Two follow-ups to last turn's 7r work. Frontend/presentation only. No DB, no schema, no prompt-builder changes.

## 1. Quick vs Detailed toggle (Step 4 + Step 5)

**New component:** `src/features/brand-scenes/wizard/components/QuickDetailedToggle.tsx`
- Two segmented chips: **Quick** (default) and **Detailed**.
- Tiny helper underneath: "Quick shows only the essentials — Detailed unlocks every dial".
- Persists choice in `sessionStorage` under `brand-scene-wizard:mode` so it survives step navigation but not new wizard runs.
- Exports `useWizardMode()` hook returning `{ mode, setMode }`.

**Step4Cast.tsx** (`/app/brand-scenes` Step 4)
- Render the toggle directly under the step header, above the cast presets.
- When `mode === 'quick'`, hide:
  - the entire "Optional styling" block (Vibe, Build, Age feel, Gender, Ethnicity, plus all `ExtrasPillField` extras)
  - storytelling moments accordion
  - wardrobe color, gaze, group dynamic, body part focus, hands-on-product
  - free-text cast note
- Always show: cast preset, interaction (when preset≠replicate), scale preset. These are the only required fields, matching `castStepValid` in `BrandSceneWizard.tsx`.
- Below the visible required fields render a subtle `+ Customize cast & styling` button that flips mode to `detailed` in place.

**Step4ModuleQuestions.tsx** (Step 5)
- Same toggle at top.
- Pass `mode` down to `FashionQuestions` / `FootwearQuestions` / `EyewearQuestions` via a new optional `mode` prop.
- In each module component, when `mode === 'quick'`:
  - Fashion: hide Vibe & props, Camera feel, Color anchor — keep only Setting.
  - Footwear: hide Scene setting (surface/location/pose) and Finishing — keep Archetype, Footwear type, Presentation (the three `required` Blocks).
  - Eyewear: same principle — keep only fields marked required in the existing component, hide the rest. (Mirror the pattern after reading file in build mode.)
- Show `+ Customize details` button to expand.

**BrandSceneWizard.tsx**
- No gating changes needed — `moduleStepValid` already uses `isFashionStepValid` etc., which only check required fields. Quick mode leaves all required answers intact (defaults stay valid for fashion which has no required fields; footwear/eyewear already required answers stay visible).

## 2. Prune redundant Step 5 module questions

Step 4 (Cast) and Step 3 (Base) already capture cast, interaction, scale, scene_type, setting, camera angle / elevation, hands-on-product, body-part focus. Step 5 should ONLY ask things the family adds on top.

**`src/features/brand-scenes/modules/fashion/FashionQuestions.tsx`**
- Remove the **Setting** block (duplicates Step 3 setting picker). Schema field `scene.location` stays for back-compat; it falls back to Step 3's value in the prompt builder, no code change needed there.
- Keep Vibe & props, Camera feel, Color anchor (fashion-specific finishing dials, not duplicated elsewhere).
- Drop the intro paragraph "Who appears … previous step" — now self-evident.

**`src/features/brand-scenes/modules/footwear/FootwearQuestions.tsx`**
- Remove the **Scene setting** Block entirely (`surface`, `location`, `pose` — all covered by Step 3 scene_type/setting and Step 4 cast/interaction).
- Keep Archetype, Footwear type, Presentation, Finishing (color anchor + camera feel).

**`src/features/brand-scenes/modules/eyewear/EyewearQuestions.tsx`**
- Audit in build mode; remove any scene/location/pose blocks that duplicate Step 3/4. Keep eyewear-specific fields (frame style, lens treatment, presentation).

**Auto-skip empty Step 5**: in `BrandSceneWizard.tsx`, if a module renders zero visible questions after pruning we still keep the step (footwear & eyewear keep required fields). No skip logic needed.

## 3. Wording

- Step 5 subtitle currently "A few extras unique to the family you picked" — keep.
- After pruning, footer hint on Fashion Step 5 reads "Optional finishing — skip and we'll use editorial defaults".

## 4. Tests

New file `src/features/brand-scenes/__tests__/wizard-polish-7s.test.tsx`:
- Renders Step4Cast in quick mode → asserts vibe/build/ethnicity blocks are absent, cast preset + interaction + scale visible.
- Clicking "+ Customize" toggles to detailed, sessionStorage updated.
- Renders FashionQuestions with `mode="quick"` → only Setting-less view shows nothing optional; only required fields render. (After Setting removal, fashion quick view is essentially empty placeholder — assert helper text.)
- Renders FootwearQuestions with `mode="quick"` → asserts only Archetype/FootwearType/Presentation visible; Scene setting hidden.

## Files

**New**
- `src/features/brand-scenes/wizard/components/QuickDetailedToggle.tsx`
- `src/features/brand-scenes/__tests__/wizard-polish-7s.test.tsx`

**Modified**
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx`
- `src/features/brand-scenes/wizard/steps/Step4ModuleQuestions.tsx`
- `src/features/brand-scenes/modules/fashion/FashionQuestions.tsx`
- `src/features/brand-scenes/modules/footwear/FootwearQuestions.tsx`
- `src/features/brand-scenes/modules/eyewear/EyewearQuestions.tsx`
- `.lovable/plan.md`

## Out of scope

- No prompt-builder edits — removed UI fields keep their schema slots so any older saved scenes still parse.
- No changes to Step 3 base answers, validation gates, or `BrandSceneWizard` flow logic.
- No DB/RLS/edge function work.
