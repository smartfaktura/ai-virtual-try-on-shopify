# Phase 6 — Eyewear Module Questions (Admin-Only)

Goal: add the **third category** to the wizard — Eyewear — following the exact pattern set by Apparel (Phase 4) and Footwear (Phase 5). Same shape, same saugikliai, same admin-only scope. Still no DB writes, still no prompt generation.

---

## Why eyewear next

Strong existing aesthetic memory (`editorial-eyewear-aesthetics`, 5 archetypes already curated). Natural next step: it's the smallest, most face-anchored category, which lets us exercise the "on-model vs. still-life" toggle one more time with a distinct vocabulary before we tackle bags/fragrance.

> If you'd rather do a different category next (bags / fragrance / activewear / accessories / beauty / home), say so and I'll re-plan in one step.

---

## Question architecture (eyewear)

Five blocks, same flow: archetype → product → presentation → scene → finishing.

### Block 1 — Archetype (single-select, required)
Drives composition + lighting defaults later. Mirrors the 5 archetypes from `editorial-eyewear-aesthetics`:
- Studio Portrait
- Cinematic Street
- Architectural Still-Life
- Sun-Drenched Editorial
- Minimal Product Macro

### Block 2 — Eyewear type (single-select, required)
- Sunglasses · Optical / clear · Sport / performance · Reading · Aviator · Round / cat-eye

### Block 3 — Presentation (single-select, required)
- On-model (face close-up)
- On-model (half-body editorial)
- Pedestal / sculptural still-life
- Pair laid flat (open)
- Macro / detail (lens, hinge)

> When presentation is "Pedestal", "Pair laid flat" or "Macro / detail" → Block 4's `expression` field is hidden (saugiklis against contradictory prompts, mirrors apparel/footwear pattern).

### Block 4 — Scene setting (optional)
- **Surface / pedestal** — short text (e.g. "warm concrete slab", "sand")
- **Location specifics** — short text (e.g. "sunlit terrace, harsh shadows")
- **Expression / pose** — short text *(hidden for still-life presentations)*

### Block 5 — Finishing (optional)
- **Color anchor** — single text input (e.g. "amber tortoise", "matte black")
- **Camera feel** — chip group, multi-select, max 2:
  - Macro detail · Wide editorial · Top-down · Low angle · 35mm film · Flash-lit · Soft daylight

---

## Answer shape (`module_answers` when `module === 'eyewear'`)

```ts
{
  archetype: 'studio_portrait' | 'cinematic_street' | 'architectural_still_life' | 'sun_drenched' | 'minimal_macro',
  eyewear_type: 'sunglasses' | 'optical' | 'sport' | 'reading' | 'aviator' | 'round_cat_eye',
  presentation: 'on_model_face' | 'on_model_half' | 'pedestal' | 'pair_flat' | 'macro_detail',
  scene: {
    surface?: string,
    location?: string,
    expression?: string,   // omitted for still-life presentations
  },
  finishing: {
    color_anchor?: string,
    camera_feel?: string[],   // max 2
  },
}
```

Schema version stays at `1`. Other modules keep their permissive slot.

---

## File plan (mirrors footwear)

```text
src/features/brand-scenes/modules/eyewear/
  questions.ts          // options, labels, constants
  schema.ts             // eyewearModuleAnswersSchema (Zod) + isEyewearStepValid
  types.ts              // EyewearModuleAnswers type
  EyewearQuestions.tsx  // Step 3 form (chips + text inputs, identical UX to apparel/footwear)

src/features/brand-scenes/wizard/steps/
  Step3ModuleQuestions.tsx   // add: module === 'eyewear' → <EyewearQuestions/>
src/features/brand-scenes/wizard/
  BrandSceneWizard.tsx       // add eyewear branch to nextDisabled gate
src/features/brand-scenes/__tests__/
  eyewear-schema.test.ts     // accept/reject cases
```

Outside the feature folder: **nothing touched**. Wizard route, gate, sidebar all unchanged.

---

## Validation rules (saugikliai)

| Rule | Where |
|------|-------|
| All three required fields present (archetype, eyewear_type, presentation) | Zod + UI counter |
| `camera_feel` length ≤ 2 | Zod + UI |
| `expression` allowed only when presentation ∈ {on_model_face, on_model_half} | Zod refine + conditional render |
| All text fields trimmed, max 160 chars | Zod |
| Unknown enum values rejected | Zod |
| Step 3 Next disabled until all 3 required selects are filled | UI gate |

---

## Out of scope

- No DB writes — Save still disabled in Step 4.
- No prompt generation — later phase.
- No image references / file uploads.
- Other 6 modules keep the placeholder.
- No sidebar or marketing changes.

---

## Acceptance checklist

- [ ] Admin: Step 1 → Eyewear → Step 3 shows the new form.
- [ ] Admin: Step 1 → Apparel/Footwear → previous forms unchanged.
- [ ] Admin: Step 1 → any other module → still sees the placeholder.
- [ ] Selecting a still-life presentation hides the Expression field.
- [ ] More than 2 camera-feel chips cannot be selected.
- [ ] Step 3 Next is disabled until all 3 required selects are filled.
- [ ] Step 4 review shows `module: "eyewear"` + populated `module_answers`.
- [ ] `bunx vitest run src/features/brand-scenes` — all phases green (Phase 2 + apparel + footwear + eyewear).
- [ ] No diff outside `src/features/brand-scenes/`.

After this phase I stop and wait for **"let's move to next phase"** (bags is the natural next; you pick).
