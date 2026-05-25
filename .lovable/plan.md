## Problem

When the user uploads a reference and picks **"Location only"** intent (Step 3), the generator often ignores the location and crops to a portrait/headshot with a generic background (see screenshot — Option 1). Root causes:

1. The `REFERENCE` section is rendered **last** in the assembled prompt (after `ROLE`, `SUBJECT`, `SCENE`, `CAMERA`, …, `NEGATIVE`, `NOTES`). Gemini treats the trailing line as a weak afterthought against the strong opening sections.
2. The "location" directive is short and vague: *"Keep the reference location and environment. Replace the cast and product per the directives below."* — no instruction to (a) preserve geometry/lighting from the reference image, (b) place the cast **inside** the environment, or (c) avoid cropping past the location.
3. No negative clause prevents the model from collapsing into a tight headshot that hides the backdrop.
4. The reference image **is** correctly attached as `inlineData` in `generate-brand-scene/index.ts`, so this is purely a prompt-engineering problem.

## Fix (3 files)

### 1. `src/features/brand-scenes/prompt/buildReferenceDirective.ts`
Rewrite the `"location"` branch as a structured multi-line directive:

```
REFERENCE IMAGE — LOCATION LOCK (highest priority).
The attached reference IS the environment. Use it as the literal backdrop:
preserve the architecture, geometry, perspective, surfaces, color palette,
and the direction and quality of light exactly as in the reference.
Place the cast and product physically INSIDE this exact location — standing
on the same floor, lit by the same lights, with the same walls/structures
visible around and behind them. Match the reference's wide framing so the
environment reads clearly; do not crop into a tight headshot or paste the
subject onto a generic background. The product and people are the only
elements that change — everything else (room, lighting, color, depth)
comes from the reference image.
```

Also tighten `"replicate"`, `"composition"`, and `"vibe"` with a one-line "highest priority" marker so the section is taken seriously regardless of intent.

### 2. `src/features/brand-scenes/prompt/assembleSceneDirective.ts`
**Move the `REFERENCE` section to the top**, immediately after `ROLE` and before `PRODUCT FOCUS`. The current order pushes it to the very end (after `NEGATIVE`). New order:

```
ROLE
REFERENCE          ← promoted
PRODUCT FOCUS
SUBJECT
SCENE
CAMERA & FRAMING
COLOR & FINISH
STYLING DETAILS
CAST DETAILS
OUTPUT
NEGATIVE
NOTES
NAME
```

Additionally, when `answers.source === "reference"` and `answers.reference_intent === "location"`, append a hard negative to the `NEGATIVE` section:

```
- Do not output a tight headshot or closeup that hides the reference environment — the reference location MUST be clearly visible around the subject in every variation.
- Do not invent a new room or background; reuse the reference scene only.
```

### 3. `src/features/brand-scenes/wizard/steps/Step3Reference.tsx`
Under the "Location only" intent tile, add a one-line helper when it's selected:

> "Upload a clean wide shot of the space — we'll place your cast and product inside it without changing the location."

(Keeps the wizard self-explanatory so users feed in usable wide shots rather than close crops.)

## Test updates
Update `src/features/brand-scenes/__tests__/reference-intent.test.ts` to match the new wording — keep the `/keep the reference location/i` matcher relaxed to `/location lock|reference location/i` so the new directive passes.

## Out of scope
- No DB schema changes.
- No edge-function changes (reference inlineData wiring is already correct).
- No new intent types — the existing four (`replicate`, `location`, `composition`, `vibe`) cover the case; we're sharpening the language behind them.
- The per-variation "deliver a distinct interpretation" preamble stays — variations are still allowed, but the strengthened directive prevents the location from being dropped.

## Expected outcome
For the tennis-court example the user uploaded:
- All 3 variations show the same tennis-court interior (architecture, blue floor, lighting rig).
- The model is placed on-court with consistent perspective and scale.
- No headshot-on-blank-background failure case.
