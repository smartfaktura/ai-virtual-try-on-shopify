# Phase 5 — Footwear Module Questions (Admin-Only)

Goal: add the **second category** to the wizard — Footwear — following the exact pattern set by Apparel in Phase 4. Same shape, same saugikliai, same admin-only scope. Still no DB writes, still no prompt generation.

---

## Why footwear next

Strong existing aesthetic memory (`editorial-shoes-aesthetics`, `editorial-sneaker-aesthetics`, `editorial-boots-aesthetics`) gives a clear, opinionated set of archetypes and shot styles. It's the closest sibling to apparel in stylist mental model.

> If you'd rather do a different category next (eyewear / bags / fragrance / activewear / accessories / beauty / home), say so and I'll re-plan in one step. Otherwise I proceed with footwear.

---

## Question architecture (footwear)

Five blocks, same flow as apparel: archetype → product → presentation → scene → finishing.

### Block 1 — Archetype (single-select, required)
Drives composition + lighting defaults later.
- Architectural Still-Life
- Dynamic On-Body
- Quiet Luxury Editorial
- Street / Documentary

### Block 2 — Footwear type (single-select, required)
- Sneakers · Boots · Heels · Loafers · Sandals · Flats · Athletic / Performance

### Block 3 — Presentation (single-select, required)
- On-foot (full leg)
- On-foot (close crop)
- Pedestal / sculptural still-life
- Pair laid flat
- Macro / detail (texture, stitching)

> When presentation is "Pedestal", "Pair laid flat" or "Macro / detail" → Block 4's `pose` field is hidden (saugiklis against contradictory prompts, mirrors apparel).

### Block 4 — Scene setting (optional)
- **Surface / pedestal** — short text (e.g. "raw plaster slab", "polished marble")
- **Location specifics** — short text (e.g. "sunlit corridor, long shadows")
- **Pose / movement** — short text *(hidden for still-life presentations)*

### Block 5 — Finishing (optional)
- **Color anchor** — single text input (e.g. "chalk white", "smoked olive")
- **Camera feel** — chip group, multi-select, max 2:
  - Macro detail · Wide editorial · Top-down · Low angle · 35mm film · Flash-lit

---

## Answer shape (`module_answers` when `module === 'footwear'`)

```ts
{
  archetype: 'architectural_still_life' | 'dynamic_on_body' | 'quiet_luxury' | 'street_documentary',
  footwear_type: 'sneakers' | 'boots' | 'heels' | 'loafers' | 'sandals' | 'flats' | 'athletic',
  presentation: 'on_foot_full' | 'on_foot_close' | 'pedestal' | 'pair_flat' | 'macro_detail',
  scene: {
    surface?: string,
    location?: string,
    pose?: string,     // omitted for still-life presentations
  },
  finishing: {
    color_anchor?: string,
    camera_feel?: string[],   // max 2
  },
}
```

Schema version stays at `1`. Other modules keep their permissive slot.

---

## File plan (mirrors apparel)

```text
src/features/brand-scenes/modules/footwear/
  questions.ts          // options, labels, constants
  schema.ts             // footwearModuleAnswersSchema (Zod) + isFootwearStepValid
  types.ts              // FootwearModuleAnswers type
  FootwearQuestions.tsx // Step 3 form (chips + text inputs, identical UX to apparel)

src/features/brand-scenes/wizard/steps/
  Step3ModuleQuestions.tsx   // add: module === 'footwear' → <FootwearQuestions/>
src/features/brand-scenes/wizard/
  BrandSceneWizard.tsx       // add footwear branch to nextDisabled gate
src/features/brand-scenes/__tests__/
  footwear-schema.test.ts    // accept/reject cases
```

Outside the feature folder: **nothing touched**. Wizard, route, gate all unchanged.

---

## Validation rules (saugikliai)

| Rule | Where |
|------|-------|
| All three required fields present (archetype, footwear_type, presentation) | Zod + UI counter |
| `camera_feel` length ≤ 2 | Zod + UI |
| `pose` allowed only when presentation ∈ {on_foot_full, on_foot_close} | Zod refine + conditional render |
| All text fields trimmed, max 160 chars | Zod |
| Unknown enum values rejected | Zod |
| Step 3 Next disabled until all three required selects are filled | UI gate |

---

## Out of scope

- No DB writes — Save still disabled in Step 4 (Phase 6).
- No prompt generation — Phase 7.
- No image references / file uploads.
- Other 7 modules keep the placeholder.
- No sidebar or marketing changes.

---

## Acceptance checklist

- [ ] Admin: Step 1 → Footwear → Step 3 shows the new form.
- [ ] Admin: Step 1 → any non-apparel-non-footwear module → still sees the placeholder.
- [ ] Admin: Step 1 → Apparel → still sees the Phase 4 form unchanged.
- [ ] Selecting a still-life presentation hides the Pose field.
- [ ] More than 2 camera-feel chips cannot be selected.
- [ ] Step 3 Next is disabled until all 3 required selects are filled.
- [ ] Step 4 review shows `module: "footwear"` + populated `module_answers`.
- [ ] `bunx vitest run src/features/brand-scenes` — all phases (Phase 2 + apparel + footwear) green.
- [ ] No diff outside `src/features/brand-scenes/`.

After this phase I stop and wait for **"let's move to next phase"** (eyewear is the natural next; you pick).
