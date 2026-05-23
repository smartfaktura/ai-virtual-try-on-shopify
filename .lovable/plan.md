## Goal

Turn Step 4 "Who's in the scene?" into an opt-in guided sub-flow: a clear branch on Essentials asks if the user wants to design a specific look. If yes, Next walks through the refinement tabs one at a time, each with its own required headline question, and Styling adds a new generic Outfit quiz with custom-text fallbacks.

---

## 1. Branch on Essentials

Below the three required Essentials fields (Who's in the shot · Product interaction · Product scale), add a compact two-card prompt:

```
DESIGN A SPECIFIC LOOK?

[ Skip — auto-cast ]    [ Yes, design the look ]
```

Hidden when cast preset is `none` or `replicate` (no people / fully locked to reference). One choice required to advance.

- **Skip — auto-cast** (default highlighted): Next on Essentials jumps straight to wizard Step 5 (Environment / Photography). Refinement tabs are not shown.
- **Yes, design the look**: People / Interaction / Styling tabs become visible and Next walks them in order.

Stored on `cast.extras.design_specific_look = "yes" | "skip"`. Reusing the existing `extras` JSON keeps the schema migration-free.

---

## 2. Sub-step navigation within Step 4

When the user picks "Yes":

- The tab bar at the top of Step 4 turns into a stepper-aware nav: each tab shows a small index (`1 People · 2 Interaction · 3 Styling`) and a check mark once its required answer is filled.
- The wizard's footer Next button stays in place; its behavior is intercepted while inside Step 4 sub-flow:
  - On Essentials → goes to first refinement tab (People) or Step 5 depending on branch.
  - On People → Interaction (Next disabled until People headline answered).
  - On Interaction → Styling.
  - On Styling → real wizard Next (Step 5).
- The wizard's Back button mirrors this in reverse.
- Tabs remain clickable for power users to jump back, but Next enforces order.

This is implemented inside `Step4Cast` via an internal `subStep` state plus an imperative handle (`useImperativeHandle`) so `BrandSceneWizard` can ask "can you advance?" / "advance now" without owning the sub-state. Falls back to wizard-step Next when the handle says "I'm done".

---

## 3. Required headline per refinement tab

Only the headline question per tab is required; the rest of the tab stays optional.

- **People** — `Energy / vibe` becomes required (with the existing dot indicator on Section).
- **Interaction** — `Action` (when people present) or `Hands on product` (when applicable for the product scale) — the first visible one becomes the headline.
- **Styling** — the new `Outfit vibe` chip group (see §4) becomes the headline.

Headline missing → Next disabled with footer tooltip: "Pick {Vibe / Action / Outfit vibe} to continue."

Tabs that have no applicable headline (e.g. Interaction when nothing applies for the current cast/scale) auto-skip in the sub-step order.

---

## 4. New Outfit-direction quiz (Styling tab)

A single `OutfitQuiz` block at the top of Styling, ahead of the existing wardrobe color / extras / note fields.

**4 slots**, each rendered as a chip row + a "Custom…" chip that reveals an inline input (max 80 chars, validated client-side):

1. **Outfit vibe** (required, headline) — Quiet luxury · Streetwear · Editorial · Athleisure · Workwear · Beachwear · Custom
2. **Top** (optional) — T-shirt · Knit · Blazer · Hoodie · Tank · None · Custom
3. **Bottom** (optional) — Jeans · Trousers · Shorts · Skirt · None · Custom
4. **Footwear** (optional) — Sneakers · Boots · Heels · Loafers · Barefoot · Custom

Storage shape on `cast.outfit`:
```ts
{
  vibe?: { preset?: OutfitVibe; custom?: string };
  top?:  { preset?: OutfitTop;  custom?: string };
  bottom?: { preset?: OutfitBottom; custom?: string };
  footwear?: { preset?: OutfitFootwear; custom?: string };
}
```
Picking a preset clears `custom`; picking Custom focuses the input and clears `preset`.

**Prompt assembly** (`assembleSceneDirective`): when any outfit field is set, emit a single line like `Outfit: quiet-luxury vibe, knit top, trousers, leather loafers`. Custom values inserted verbatim. When wardrobe color anchor is also set, both lines render — wardrobe controls color, outfit controls garments. Family hides outfit entirely for non-apparel families that already hide People (`tech`, `home`, `food-drink`, `wellness` when cast is `none`).

Auto-hide rules:
- Cast preset = `none` or `hands` → no outfit quiz (nothing to dress).
- Sub-family in `["swimwear", "lingerie"]` → top / bottom slots replaced with "Swimwear cut" / "Lingerie cut" presets; vibe stays.
- Cast preset = `replicate` → entire styling tab stays hidden (already the case).

---

## 5. Required-state styling

Reuse the quiet dot + bold "Required" cap already added in the previous round. No red. The dot appears on:
- Essentials headlines (already done)
- The new "Design a specific look?" choice
- The headline question of each visible refinement tab

---

## Files touched

- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` — branch card, sub-step nav, imperative handle, required headlines, outfit quiz mount.
- `src/features/brand-scenes/wizard/BrandSceneWizard.tsx` — wire the imperative handle so Next/Back delegate to Step 4 first, fall through to wizard step nav otherwise; update `nextDisabledReason`.
- `src/features/brand-scenes/wizard/components/OutfitQuiz.tsx` — new component (4 slots, chip + custom input each).
- `src/features/brand-scenes/wizard/constants/outfit.ts` — new constants for slot presets and types.
- `src/features/brand-scenes/types.ts` — extend `BrandSceneCast` with optional `outfit` field.
- `src/features/brand-scenes/schema.ts` — extend Zod schema for `outfit`.
- `src/features/brand-scenes/prompt/assembleSceneDirective.ts` — emit the Outfit line.
- `src/features/brand-scenes/prompt/buildCastDirective.ts` (or wherever outfit makes most sense) — wired so wardrobe + outfit don't fight.
- Tests: extend `__tests__/scene-extras.test.ts` with an outfit case; extend `__tests__/cast-directive.test.ts` for the new directive line.

## Out of scope

- No schema migration in the DB (outfit lives inside the existing `cast` JSONB column with the rest of the brand-scene answers).
- No changes to other wizard steps, no copy rewrites outside Step 4.
- No backend, edge functions, or prompt-token registry changes.
