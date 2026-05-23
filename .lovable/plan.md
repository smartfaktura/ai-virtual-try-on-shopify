## Goal
On `/app/brand-scenes/new` Step 3 (Reference & Intent), when the user uploads a reference image, run an AI analysis that produces a **highly detailed outfit direction** for the people in that image. Store it on the scene, show it to the user inline with an editable text area, and feed it forward into Step 4 (Cast → Styling/Outfit) so it drives later product visual generations.

## UX flow (Step 3)

After a successful upload (in `Step3Reference.tsx`), a new card appears beneath the image:

```text
┌─ AI outfit direction ──────────────────┐
│ [Analyzing reference…] (spinner)       │
│   ↓                                    │
│ <multiline textarea, prefilled>        │
│ [Re-analyze]   [Use as outfit guide ✓] │
└────────────────────────────────────────┘
```

- Auto-runs once when an image is added (only if no description exists yet).
- User can edit freely (max ~1200 chars).
- "Re-analyze" re-runs the edge function and overwrites if user confirms.
- Removing/replacing the image clears the analysis.
- Skippable — empty value = no outfit direction injected.

## What the AI returns (structured)

Single edge function `analyze-reference-outfit` calling Lovable AI Gateway (`google/gemini-3-flash-preview`, vision + JSON tool-calling) with the reference image URL. Returns:

- `people_present` (bool) — if false, we show a small "no people detected — skip" hint and don't save.
- `outfit_description` — long-form paragraph, the editable field.
- `breakdown`:
  - `silhouette` (fit, length, layering)
  - `top` (garment type, fabric, color, pattern, details)
  - `bottom`
  - `outerwear`
  - `footwear`
  - `accessories` (bag, jewelry, eyewear, headwear, belts, watches)
  - `palette` (2–4 dominant colors w/ rough hex)
  - `fabric_notes` (texture, sheen, drape)
  - `styling_notes` (tucked/untucked, sleeves rolled, buttons, posture cues affecting fit)
  - `era_or_vibe` (e.g. "quiet luxury 2020s editorial")

The textarea is prefilled from `outfit_description`; the breakdown is shown as small read-only chips below it for transparency (collapsible "Details" disclosure).

## Data model

Extend `BrandSceneAnswers.base.reference` (or top-level base) with:

```ts
reference_outfit?: {
  description: string;        // editable, primary
  breakdown?: { ... };        // raw structured (read-only display + future use)
  source_image_path: string;  // so we know it's stale if image changes
  generated_at: string;
  edited_by_user: boolean;
};
```

Mirror in `schema.ts` (Zod). Persisted alongside other answers (no DB schema change — already JSONB).

## Prompt wiring (forwarding into generations)

In `buildCastDirective.ts` / `assembleSceneDirective.ts`:
- If `base.reference_outfit.description` exists AND cast includes people, append as a new "Outfit Direction (from reference):" block, **after** the existing manual outfit slots so user overrides still win.
- Add a guard: if Step 4 outfit slots are filled, prefer those for the matching slot but keep the reference outfit text as supplemental context.
- A unit test ensures the directive includes the outfit text when present.

Step 4 Cast / OutfitQuiz: show a small banner "Using outfit from reference — edit in Step 3 or override per slot below" when reference outfit exists.

## Files to add / edit

**New**
- `supabase/functions/analyze-reference-outfit/index.ts` — JWT-verified, validates payload (`imageUrl` or `imagePath`), calls Lovable AI Gateway with vision + tool-call schema, returns JSON. Handles 429/402 passthrough.
- `src/features/brand-scenes/wizard/components/ReferenceOutfitCard.tsx` — UI card (loading, textarea, breakdown disclosure, re-analyze).
- `src/features/brand-scenes/__tests__/reference-outfit-directive.test.ts` — verifies prompt assembly.

**Edited**
- `src/features/brand-scenes/wizard/steps/Step3Reference.tsx` — mount new card after upload; pipe value into wizard state; clear on image remove.
- `src/features/brand-scenes/wizard/BrandSceneWizard.tsx` — new dispatch actions (`setReferenceOutfit`, `clearReferenceOutfit`) and wiring to Step 3.
- `src/features/brand-scenes/types.ts` + `schema.ts` — add `reference_outfit` shape.
- `src/features/brand-scenes/prompt/buildCastDirective.ts` + `assembleSceneDirective.ts` — inject reference outfit block.
- `src/features/brand-scenes/wizard/components/OutfitQuiz.tsx` — add "from reference" banner.
- `src/features/brand-scenes/wizard/steps/Step5Review.tsx` — show outfit direction in review.

## Out of scope
- No DB migration (uses existing JSONB answers column).
- No changes to other wizards / Product Images flow.
- No new secrets — uses existing `LOVABLE_API_KEY`.
- Doesn't auto-apply outfit to individual slot pickers (top/bottom/footwear) — only injects as a freeform direction so user retains slot-level control.
