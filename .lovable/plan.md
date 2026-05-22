
# Plan — Cast step + Product scale + Reference replicate mode

## Why

Today's wizard captures aesthetic (scene type, mood, lighting, framing) but is silent on the three things that decide whether a scene works:

1. **Who is in it and what they do with the product** — no subject step.
2. **How big the product is in the frame** — AI has no scale anchor.
3. **What the reference image actually means** — currently ambiguous; uploads often regenerate to "empty location" or override user direction.

This plan adds one new step (**Cast & product interaction**) plus a **Product scale** block, tightens the reference flow with a clear intent + a new **"Replicate exactly"** mode, and introduces a 3-preview generation loop before the user commits a scene to their private library.

## Naming

- New step: **"Cast & product interaction"** (key `cast`)
- New sub-block: **"Product scale"** (key `scale`)
- Reference upload gains an explicit **intent** selector + a **Replicate** mode

## Wizard shape

```text
0  Source              (wizard | reference)
1  Family
2  Sub-family
3  Scene aesthetic     (existing — + aspect ratio + time of day)
4  Cast & interaction  ← NEW — runs in BOTH flows
5  Category details    (wizard only)
6  Preview & pick      ← NEW — generate 3, pick 1, save
7  Review / saved
```

## Step 4 — Cast & product interaction

Pill blocks using existing `Chip` / `AddChip` primitives.

1. **Cast** (single-select, required)
   - `Solo person`, `Two people`, `Group (3+)`, `Hands only`, `No people — product hero`
   - **Reference-only extra option:** `Replicate reference exactly` — see "Replicate mode" below.
2. **People details** (only when cast ≠ "No people" and not "Replicate")
   - Gender mix · Age feel · Vibe (`Athlete`, `Creative`, `Professional`, `Casual`, `Editorial model`)
3. **Product interaction** (single-select, required unless Replicate)
   - `Wearing`, `Holding`, `Using`, `Placed beside`, `Hero — product only`
   - Family-filtered.
4. **Action / energy** (optional)
   - `Still`, `Walking`, `Mid-motion`, `Seated`, `Candid`
5. **Product scale** (single-select, required) — see below
6. **Free note** (160 chars)

## Product scale block

**Tier A — preset** (always shown):
- `Pocket` (≤15 cm) · `Handheld` (15–35) · `Carry` (35–80) · `Furniture` (80–200) · `Architectural` (>200) · `Wearable on body` (scaled to model)
- Auto-suggested from sub-family, always overridable.

**Tier B — exact dimensions** (collapsible "Add exact size"):
- W × H × D, units cm/in. Wins over preset in the directive when provided.

## Reference flow — three explicit modes

Today reference uploads collapse three different intents into one. Split them with a small radio at the top of Step 3 (reference):

**"Use this image as…"**
- `Replicate exactly` — **NEW.** Keep subject, product, framing, lighting all locked. Wizard's people/interaction blocks hide; Cast block shows only "Replicate reference exactly" auto-selected. Scale still asked because the inserted product may not be the same physical size as what's in the photo.
- `Location only` — keep the place, replace everything else. Cast + interaction fully editable.
- `Composition` — keep framing/lighting/layout, swap subject. Cast + interaction fully editable.
- `Vibe / mood board` — loose inspiration only.

This single choice deterministically prefixes the prompt builder:
- Replicate → "Do not alter subject, pose, framing, or environment. Insert the product as a faithful in-place addition matching the scene's lighting."
- Location → "Keep reference as location. Replace cast with: …"
- Composition → "Keep reference framing/lighting/layout. Replace subject with: …"
- Vibe → "Loose inspiration from reference. Generate fresh."

The old free-text "Product placement" field is removed — Cast + Scale + Intent supersede it.

## Step 6 — Preview & pick (new)

This is the part that lets the user "fit 1 to save". After Step 5:

- **Generate 3 variants** of the scene in parallel using the assembled directive.
- Each card shows the image + a small "Refine" button.
- **Refine inline:** the user can tweak Cast / Scale / Notes (a compact drawer) and **regenerate** without leaving this step. New variants replace old ones; rejected ones are discarded.
- **Pick one** → fades the other two and unlocks "Save to Brand Scenes Library".
- Saved scene stores: chosen image URL + full final answers payload (cast, scale, base, reference + intent if any) so the prompt can be re-run later.

Refine→regenerate works for both flows, including Reference + Replicate (re-runs with same lock but the user can adjust scale or add a note).

This loop is what the user described: explore 3, iterate cast details, commit only when satisfied.

## Other gaps folded in

- **Aspect ratio** — chip row on Step 3: `4:5` (default), `1:1`, `3:4`, `16:9`. Generation already supports per-scene ratios (see [Advanced Scene Controls](mem://features/product-images/advanced-scene-controls)).
- **Time of day** — split out of Lighting: `Morning`, `Midday`, `Evening`, `Night` (optional).
- **Fashion `wearer`** — replaced by Cast. Keep in schema as derived value (`solo+wearing → on_model_full`, `hands_only → detail_only`, `no_people+hero → flat_lay`) so existing prompt-builders keep working.
- **"Avoid" field** — optional textarea on Review ("no logos visible, no children, no…"). Maps to negative-prompt slot.

## Schema additions (frontend-only, no migration)

`brand_scene_answers` (JSONB, no SQL migration; `protect_brand_scene_writes` already accepts arbitrary JSON):

```ts
cast: {
  preset: "solo" | "two" | "group" | "hands" | "none" | "replicate";
  gender?: ("woman" | "man" | "mixed" | "any")[];
  age?: ("young" | "adult" | "mature" | "mixed")[];
  vibe?: "athlete" | "creative" | "professional" | "casual" | "editorial";
  interaction?: "wearing" | "holding" | "using" | "beside" | "hero";  // optional when replicate
  action?: "still" | "walking" | "motion" | "seated" | "candid";
  note?: string;
}

scale: {
  preset: "pocket" | "handheld" | "carry" | "furniture" | "architectural" | "on_body";
  dimensions?: { w: number; h: number; d?: number; units: "cm" | "in" };
}

base.aspect_ratio?: "4:5" | "1:1" | "3:4" | "16:9";
base.time_of_day?: "morning" | "midday" | "evening" | "night";

reference_intent?: "replicate" | "location" | "composition" | "vibe";
negative_note?: string;

preview_variants?: { image_url: string; generation_id: string; chosen?: boolean }[];
```

All new fields optional in Zod so existing drafts parse. UI gates new fields per-step.

## Prompt builders (shipped, not yet wired)

- `buildCastDirective(cast, source, intent)` — handles "replicate" passthrough.
- `buildScaleDirective(scale, family)`
- `buildReferenceDirective(intent)` — emits the lock/replace/inspire prefix.
- `assembleSceneDirective(answers)` — combines everything in canonical order. Used by Step 6's regenerate action and by future pipeline wiring.

Wiring into the live product-images / catalog pipelines is **out of scope** for this PR; Step 6 uses the directive function directly against the existing image generation edge function so the preview loop works end-to-end.

## Validation & gating

- Step 3 (reference): image + name + `reference_intent` required.
- Step 4: `cast.preset` + `scale.preset` required; `cast.interaction` required unless `cast.preset === "replicate"`.
- Step 6: cannot save until one variant is picked.

## Tests

- `cast-step.test.tsx` — replicate option only shown for reference; people details hidden under replicate.
- `scale-step.test.tsx` — auto-suggestion per family.
- `reference-intent.test.ts` — directive prefix per intent.
- `cast-directive.test.ts`, `scale-directive.test.ts`.
- `preview-step.test.tsx` — refine→regenerate replaces variants; save disabled until pick.
- Update `fashion-schema.test.ts` — Cast replaces `wearer`.

## Files

New:
- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx`
- `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx`
- `src/features/brand-scenes/wizard/constants/{cast,scale}.ts`
- `src/features/brand-scenes/prompt/{buildCastDirective,buildScaleDirective,buildReferenceDirective,assembleSceneDirective}.ts`
- Tests above.

Edited:
- `src/features/brand-scenes/types.ts` — new fields.
- `src/features/brand-scenes/schema.ts` — Zod (all optional).
- `src/features/brand-scenes/wizard/useWizardState.ts` — new actions, step renumbering, variant state.
- `src/features/brand-scenes/wizard/BrandSceneWizard.tsx` — insert steps 4 + 6, gating, META.
- `src/features/brand-scenes/wizard/steps/Step3BaseAnswers.tsx` — aspect ratio + time of day rows.
- `src/features/brand-scenes/wizard/steps/Step3Reference.tsx` — intent radio incl. Replicate; drop free-text placement.
- `src/features/brand-scenes/modules/fashion/FashionQuestions.tsx` — drop "Who's wearing it" + pose.
- `src/features/brand-scenes/wizard/steps/Step5Review.tsx` — Cast + Scale + Avoid summary; renumber to feed Preview step.

Out of scope (separate PR): wiring the directive bundle into live product-images / catalog generation pipelines beyond the Preview step's own calls.
