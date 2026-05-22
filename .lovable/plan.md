# Phase 4 — Apparel Module Questions (Admin-Only)

Goal: ship the **first real category** in the wizard. Replace Step 3's placeholder with a focused, opinionated questionnaire for **Apparel** that produces a structured payload ready for Phase 7's prompt engineer. Still admin-only, still no DB writes, still no generation.

---

## Why apparel first

It's the highest-traffic category and the one with the richest existing aesthetic memory (`editorial-apparel-aesthetics`: Studio / Elevated Location / Everyday UGC / Campaign). The four archetypes give us a clean primary axis to build around.

---

## Question architecture (apparel)

A tight 5-block form. Each block is purposeful — no decorative questions. Order matches how a stylist thinks: archetype → garment → person → scene → finishing.

### Block 1 — Archetype (single-select, required)
The visual world. Drives composition + lighting defaults later.
- Editorial Studio
- Elevated Location
- Everyday UGC
- Campaign Statement

### Block 2 — Garment focus (multi-select, required, max 3)
- Outerwear · Knitwear · Tailoring · Denim · Dresses · Tops · Bottoms · Loungewear

### Block 3 — Wearer (single-select, required)
- On-model (full body)
- On-model (cropped / half)
- Flat lay / Ghost mannequin
- Detail / Texture only (no person)

> When this is "Flat lay" or "Detail only", Blocks 4's pose field is hidden — saugiklis to prevent contradictory prompts.

### Block 4 — Scene setting (3 sub-fields, all optional but recommended)
- **Location specifics** — short text (e.g. "concrete loft with arched windows")
- **Props & styling** — short text (e.g. "vintage chair, draped fabric")
- **Pose / energy** — short text (e.g. "leaning relaxed, hand in pocket") *(hidden when no-person wearer)*

### Block 5 — Finishing (2 fields, optional)
- **Color anchor** — single text input (e.g. "warm sand", "smoked olive"). Free text, not the brand palette — this is the dominant scene color.
- **Camera feel** — chip group, multi-select, max 2:
  - Wide editorial · Tight crop · 35mm film · Soft DOF · Documentary · Flash-lit

---

## Where the answers land

All collected values write into `answers.module_answers` (existing JSONB slot from Phase 2):

```ts
{
  archetype: 'editorial_studio' | 'elevated_location' | 'everyday_ugc' | 'campaign_statement',
  garment_focus: string[],          // max 3
  wearer: 'on_model_full' | 'on_model_crop' | 'flat_lay' | 'detail_only',
  scene: {
    location?: string,
    props?: string,
    pose?: string,                  // omitted when wearer has no person
  },
  finishing: {
    color_anchor?: string,
    camera_feel?: string[],         // max 2
  },
}
```

This shape is added to the Phase 2 Zod schema as a **discriminated branch** keyed by `module: 'apparel'`. Other modules keep their permissive `module_answers: Record<string, unknown>` slot until their phase lands. Schema version stays at `1` (additive, optional fields).

---

## File plan

```text
src/features/brand-scenes/
  modules/
    apparel/
      questions.ts          // options, labels, constants for this module
      schema.ts             // apparelModuleAnswersSchema (Zod)
      ApparelQuestions.tsx  // the actual Step 3 form for apparel
      types.ts              // ApparelModuleAnswers TS type
  wizard/
    steps/
      Step3ModuleQuestions.tsx  // becomes a router: apparel → <ApparelQuestions/>, else placeholder
    useWizardState.ts            // unchanged — already supports setModuleAnswers
  schema.ts                      // extends brandSceneAnswersSchema with apparel branch
  __tests__/
    apparel-schema.test.ts       // accept/reject cases
```

Touched outside the feature folder: **none**. Wizard, route, gate all unchanged.

---

## Validation rules (saugikliai)

| Rule | Where |
|------|-------|
| `garment_focus` length 1..3 | Zod + UI counter |
| `camera_feel` length ≤ 2 | Zod + UI |
| `pose` allowed only when `wearer ∈ {on_model_full, on_model_crop}` | Zod refine + conditional UI render |
| All text fields trimmed, max 160 chars | Zod |
| Unknown archetype / wearer rejected | Zod enum |
| Step 3 "Next" disabled until Block 1, 2, 3 valid | UI + safeParse |

---

## What stays out of scope

- No DB writes — Save still disabled in Step 4 (lands in Phase 6).
- No prompt generation — Phase 7 reads the structured payload.
- No image references / file uploads — separate later phase.
- No other category gets real questions yet — they keep the "ships in a later phase" placeholder.
- No sidebar exposure changes.

---

## Acceptance checklist

- [ ] Admin walks Step 1 → picks **Apparel** → Step 3 shows the new form (no placeholder).
- [ ] Admin picks any other module → Step 3 still shows the existing placeholder.
- [ ] Selecting Flat lay / Detail only hides the Pose field.
- [ ] Trying to select 4+ garments or 3+ camera-feel chips is blocked in UI.
- [ ] Step 3 Next is disabled until required blocks are filled.
- [ ] Step 4 review JSON shows `module: "apparel"` + populated `module_answers` matching the schema.
- [ ] `bunx vitest run src/features/brand-scenes` — Phase 2 tests + new apparel tests all green.
- [ ] No diff in DB, edge functions, or other category code paths.

After this phase I stop and wait for **"let's move to next phase"** before starting Phase 5 (next category — your pick: footwear, eyewear, bags, etc.).
