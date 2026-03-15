

## Product Perspectives — Prompt Engineering Audit

### Current State

The prompt is built in `buildPerspectivePrompt()` in `useGeneratePerspectives.ts` and passed through without polishing (`polishPrompt: false`, `isPerspective: true`). The edge function correctly:
- Skips the generic polisher
- Forces `google/gemini-3-pro-image-preview`
- Injects `referenceAngleImage` as `[REFERENCE IMAGE]` after the content array

### Issues Found

#### Issue 1 — "Wide / Environment" perspective contradicts the environment rules
The DB instruction says: *"Pulled-back contextual shot showing the product in its full environment... Lifestyle or editorial feel."*
But `buildPerspectivePrompt` always appends: *"ENVIRONMENT CONSISTENCY: Place the product on a clean, neutral surface in a professional studio environment... No environmental props."*

These directly contradict each other. The Wide/Environment perspective is supposed to show contextual surroundings, but the environment layer forbids it.

**Fix**: Make the environment layer conditional — use studio rules for angle/detail perspectives, but allow contextual/lifestyle setting for the Wide/Environment perspective.

#### Issue 2 — Each perspective instruction is generic, not angle-specific photography
The DB instructions like *"Left side profile view at a 90-degree angle"* are decent but lack specific photography direction for each angle. Professional product photography has very specific technical requirements per angle:
- **Close-up/Macro**: Needs focus stacking direction, specific DoF guidance, lighting angle for texture revelation
- **Back Angle**: Needs instruction to maintain same scale/framing as front, specific label/tag handling
- **Left/Right Side**: Needs exact camera height (eye-level), rotation specification, consistent shadow direction
- **Wide/Environment**: Needs product-to-frame ratio guidance, contextual styling rules

**Fix**: Enhance `buildPerspectivePrompt` to inject angle-specific photography DNA per variation type, rather than one generic photography layer.

#### Issue 3 — "No people" negative is wrong for Wide/Environment
The negatives layer always includes *"No people, no human figures, no hands"*. The Wide/Environment shot might benefit from lifestyle context where people could appear. However, since this is product-only perspectives (not try-on), keeping "no people" is likely correct. No change needed here.

#### Issue 4 — Missing depth-of-field guidance per perspective
Close-up/Macro specifically needs shallow DoF, while Back/Side angles need deep DoF (everything sharp). The current photography layer says *"85mm f/2.8 macro lens"* universally, but f/2.8 on macro creates very shallow DoF — wrong for full-product angle shots.

**Fix**: Vary the lens/aperture spec per perspective type.

---

### Fix Plan

#### `src/hooks/useGeneratePerspectives.ts` — Make `buildPerspectivePrompt` angle-aware

Replace the single generic prompt builder with angle-specific photography layers:

| Perspective | Lens/DoF | Environment | Special Direction |
|---|---|---|---|
| Close-up/Macro | 100mm macro, f/4, focus stacking | Neutral studio, tight crop | Reveal texture grain, stitching detail, material edges |
| Back Angle | 85mm, f/8, deep DoF | Same studio as front | Match front shot scale and framing, show labels/tags if present |
| Left Side | 85mm, f/8, deep DoF | Same studio as front | Camera at product midpoint height, exact 90° rotation |
| Right Side | 85mm, f/8, deep DoF | Same studio as front | Camera at product midpoint height, exact 90° rotation, mirror of left |
| Wide/Environment | 35mm, f/5.6 | Contextual lifestyle setting with props | Product is hero but only 30-40% of frame, complementary styling |

The function will detect the variation category (`detail`, `angle`, `context`) and apply the right layers.

#### DB variation instructions — enhance (optional, via migration)

Update the stored instructions to be more specific, though the hook-level enhancement covers most of this.

### Files changed
| File | Change |
|---|---|
| `src/hooks/useGeneratePerspectives.ts` | Make `buildPerspectivePrompt` angle-category-aware with per-perspective photography DNA, conditional environment rules, and varied lens specs |

