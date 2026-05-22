# Phase 6.5 — Category Alignment + Subfamily + Source Fork + Generation Economics

Last foundation phase. Three structural fixes plus locking in the generation economics, so Phase 7 (end-to-end) lands on something real.

---

## Part A — Align brand-scene families with the canonical 12

Source of truth: `src/lib/categoryConstants.ts` → `PRODUCT_CATEGORIES`.

| Canonical family id | Brand-scene module today | Action |
|---|---|---|
| `fashion` | `apparel` | **Rename** apparel → fashion |
| `footwear` | `footwear` | Keep (unlocked) |
| `bags-accessories` | `bags` + `accessories` | **Merge**, locked |
| `hats-caps-beanies` | — | **Add**, locked |
| `watches` | — | **Add**, locked |
| `eyewear` | `eyewear` | Keep (unlocked) |
| `jewelry` | — | **Add**, locked |
| `beauty-fragrance` | `beauty` + `fragrance` | **Merge**, locked |
| `home` | `home` | Keep, locked |
| `tech` | — | **Add**, locked |
| `food-drink` | — | **Add**, locked |
| `wellness` | `activewear` (dropped) | **Add**, locked |

`activewear` is dropped from the top level (it's a sub-type of fashion, comes back as an archetype later).

**Unlocked after 6.5**: fashion, footwear, eyewear (3).
**Locked with "Coming soon" chip**: the other 9.

---

## Part B — New Step 2: Pick a sub-family

After the family, the user picks a **sub-family** (which becomes `category_collection` on the saved row). This matches the existing taxonomy used in onboarding and `/app/freestyle`.

Source of truth: `src/lib/onboardingTaxonomy.ts` → `SUB_TYPES_BY_FAMILY`. Example: Fashion → `[garments, hoodies, dresses, jeans, jackets, activewear, swimwear, lingerie, streetwear]`. Footwear → `[shoes, sneakers, boots, high-heels]`. Eyewear → `[eyewear]` (single sub-family auto-selected).

### Behavior

- Multi-select disallowed — exactly **one** sub-family per scene.
- Single-option families (eyewear, watches, etc.) auto-select that sub-family and skip the step.
- The chosen sub-family **is** the saved `category_collection`. No more `"brand"` placeholder.
- Validation: sub-family must belong to the chosen family (Zod refine using `SUB_TYPES_BY_FAMILY`).

### Wizard step renumbering

```
Step 0 — How do you want to build this scene?  (wizard / from reference)
Step 1 — Choose a family                       (12 cards, 3 unlocked)
Step 2 — Choose a sub-family                   (auto-skip when only one)
Step 3 — Brand aesthetic                       (existing base questions)
Step 4 — Category details                      (existing module-specific questions)
Step 5 — Review                                (existing)
```

---

## Part C — Step 0: Wizard vs Reference fork

New first step. Two cards. Reference path is locked behind a hard responsibility gate.

### Path A — Wizard
The existing flow. Family → sub-family → base → module → review.

### Path B — Reference image
1. **Responsibility modal** (hard-blocks the upload field):
   - Three explicit checkboxes:
     - "I own these images or have explicit permission to use them"
     - "These images do not contain copyrighted logos, trademarks, or recognizable people without consent"
     - "I understand VOVV.AI will use them only to extract mood, color, and composition — never to reproduce them"
   - Typed confirmation: user types `I AGREE`
   - Buttons: Cancel · "I take responsibility, continue"
   - Pass stored in `sessionStorage` (per-browser-session)
2. **Upload field** — 1–3 images, max 8MB each, JPG/PNG/WEBP, client-side MIME/dimension check.
3. **Storage and AI mood extraction land in Phase 7a** — Step 0 in 6.5 only ships the UI shells, the modal, and the `source` field on the wizard state.

A `source: 'wizard' | 'reference'` field is added to `BrandSceneAnswers`. JSONB column, no migration.

---

## Part D — Generation economics (mirrors brand-models)

Lock these in now so Phase 7d implements the right pipeline from day one. No code in 6.5 — just constants and documented contract.

### Contract

- **Cost**: `20 credits` per scene generation.
- **Outcomes**: each generation returns **3 variations**, user picks which one(s) to keep.
- **Keep flow**:
  - User clicks "Save to my scenes" on a chosen variation → that variation becomes a row in `product_image_scenes` with `is_brand_scene = true`, `preview_image_url = <picked_variation_url>`.
  - User may save multiple of the 3 (each becomes its own scene row).
  - Unsaved variations are discarded after 7 days (cleanup job, deferred).
- **Pipeline**: existing 3-tier fallback (Gemini Pro → Seedream 4.5 → Gemini Flash), forced 2K PNG (mem: Generation Quality Limits).
- **Aspect ratio**: 4:5 default for on-model, 1:1 for still-life (mem: Seedream Optimization).
- **Reference path**: when `source: 'reference'`, the uploaded images are passed as reference anchors to Gemini Pro (mem: Native Gemini Generation), and the prompt is built from the AI mood extraction + user-confirmed wizard answers.
- **Credit deduction**: atomic RPC `consume_brand_scene_credits(user_id, 20)` runs **before** enqueue. Failure surfaces "Insufficient credits" with the standard top-up CTA (mem: Post-Gen Conversion).

### What lands in 6.5 (code)

```text
src/features/brand-scenes/constants.ts
  → BRAND_SCENE_GENERATION_COST = 20
  → BRAND_SCENE_VARIATIONS_PER_GENERATION = 3
  → BRAND_SCENE_REFERENCE_MAX_IMAGES = 3
  → BRAND_SCENE_REFERENCE_MAX_BYTES = 8 * 1024 * 1024
```

Step 5 (Review) shows a clear cost line:

> "Generating this scene costs **20 credits** and produces 3 variations to choose from. Saving is free; only generation deducts credits."

The actual generation call, RPC, and 3-variation picker UI are built in **Phase 7d**.

---

## Full code change list for 6.5

```text
src/features/brand-scenes/
  constants.ts
    → BRAND_SCENE_MODULES = 12 canonical ids
    → BRAND_SCENE_MODULE_LABELS (from PRODUCT_CATEGORIES)
    → BRAND_SCENE_UNLOCKED_MODULES = ['fashion', 'footwear', 'eyewear']
    → BRAND_SCENE_GENERATION_COST / VARIATIONS / REFERENCE limits

  modules/apparel/  →  modules/fashion/   (rename + export rename)
  __tests__/apparel-schema.test.ts → fashion-schema.test.ts

  types.ts
    → BrandSceneAnswers gains: source, sub_family
    → BrandSceneAnswers gains optional: reference_image_paths[]

  schema.ts
    → brandSceneAnswersSchema adds source + sub_family + reference paths
    → brandSceneDraftSchema refines sub_family ∈ SUB_TYPES_BY_FAMILY[module]

  wizard/
    useWizardState.ts          → step count 4 → 6; add source, sub_family, reference_images
    BrandSceneWizard.tsx       → render the 6 steps, validation gates per step
    steps/
      Step0ChooseSource.tsx        NEW
      Step1ChooseModule.tsx        REWRITE (12 cards, lock chip)
      Step2ChooseSubFamily.tsx     NEW (auto-skip when single option)
      Step3BaseAnswers.tsx         (was Step2 — rename only)
      Step4ModuleQuestions.tsx     (was Step3 — rename + fashion switch)
      Step5Review.tsx              (was Step4 — adds cost line)
    components/
      ResponsibilityModal.tsx      NEW
      ReferenceImagePicker.tsx     NEW (UI shell, no upload yet)

  __tests__/
    source-fork.test.ts            NEW (schema accepts both sources)
    subfamily.test.ts              NEW (rejects sub_family not in family)
```

### DB

`brand_scene_module` is free-form text; no enum migration needed.
`brand_scene_answers` is JSONB; adding `source` and `sub_family` is code-only.
**`category_collection`** is already a column on `product_image_scenes` — Phase 7a will populate it from the wizard's chosen sub-family.

---

## Out of scope for 6.5 (lands later)

- Storage bucket for `brand-scene-refs` + RLS — Phase 7a
- Actual upload, AI mood extraction — Phase 7a
- RPC `consume_brand_scene_credits` — Phase 7d
- 3-variation picker UI — Phase 7d
- Generation enqueue + fallback chain wiring — Phase 7d
- 7-day cleanup of unsaved variations — Phase 7e
- The 9 locked modules' question forms — Phase 8+

---

## Acceptance for Phase 6.5

- [ ] Step 1 lists the 12 canonical families with labels matching `/app/generate/product-images`.
- [ ] Only fashion, footwear, eyewear are clickable. Others show a "Coming soon" chip.
- [ ] Step 2 shows the right sub-families per family (from `SUB_TYPES_BY_FAMILY`), single-option families auto-advance.
- [ ] Step 0 forks Wizard vs Reference. Reference is blocked until the responsibility modal passes.
- [ ] Step 5 (Review) shows the "20 credits → 3 variations" cost line and the saved sub-family.
- [ ] No `apparel` strings remain inside `src/features/brand-scenes/`.
- [ ] `bunx vitest run src/features/brand-scenes` — all green (renamed apparel suite, new subfamily + source-fork suites).
- [ ] No diff outside `src/features/brand-scenes/` except imports from `categoryConstants.ts` and `onboardingTaxonomy.ts`.

---

## After 6.5 — path to full scope

1. **Phase 7a** — Save + List + Delete + storage bucket for reference images
2. **Phase 7b** — Prompt builder (fashion/footwear/eyewear + base + reference-mood)
3. **Phase 7c** — Edit flow at `/app/brand-scenes/:id/edit`
4. **Phase 7d** — Generation: RPC credit deduction + 3-variation picker + save chosen
5. **Phase 7e** — Polish + dogfood + cleanup job
6. **Phase 8+** — Unlock locked families one at a time (bags-accessories first)
7. **Final phase** — Remove admin gate, sidebar, marketing copy

Each post-6.5 phase ends with something the user can see, click, and judge.
