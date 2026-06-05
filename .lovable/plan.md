# Material Swap — strengthen swatch fidelity, drop the extra-direction field

Skip per-material questions. Instead, push the AI harder to **read the swatch image itself** (texture grain, weave, pile, sheen, softness) and apply it correctly — and remove the now-redundant global "Extra direction" field.

## Changes

### 1. `src/hooks/useMaterialSwap.ts` — prompt rewrite

Replace `MATERIAL APPLICATION` block with a stronger, more analytical contract that forces the model to inspect the swatch before applying it. New structure:

- **SWATCH ANALYSIS — READ THE FIRST IMAGE CAREFULLY:**
  - Identify the material family from visual cues: hard vs soft, woven vs knit vs pile vs leather vs wood vs metal vs stone vs glass.
  - Read texture grain (smooth, ribbed, brushed, hammered), weave scale, pile height/direction, sheen (matte / satin / glossy / metallic), micro-detail (knots, slubs, pores, veins), softness vs rigidity.
  - Read true colour under neutral light; ignore the swatch's own lighting bias, background tint, and any props.
- **TARGET SURFACES — MATCH PHYSICALITY:**
  - Soft materials (fabric, leather, velvet, bouclé, suede, wool) → apply ONLY to upholstered / soft surfaces.
  - Hard materials (wood, metal, stone, glass, plastic, lacquer) → apply ONLY to the corresponding hard parts (frame, legs, base, top); leave upholstered areas untouched.
  - If the swatch is ambiguous, infer from texture: high pile = velvet/bouclé; flat woven = linen/wool; pebble grain = leather; visible knots/rings = wood; reflective + cool = metal; veined = stone.
- **PHYSICAL REALISM:**
  - Preserve realistic weave/grain/vein scale relative to the product's real-world size — never stretch a swatch 1:1 across a large surface.
  - Drape, fold, and tension must match the material's softness/rigidity (soft sags into cushions, leather creases at seams, wood stays rigid, metal reflects, stone is opaque).
  - Lighting and shadows on the new material must follow the scene's existing light direction and intensity.
- **DO NOT IMPORT FROM THE SWATCH:** background, lighting, framing, props, or any object boundaries.

Keep `SCENE & PRODUCT FIDELITY` and `NEGATIVES` blocks unchanged.

Remove the `userNote` parameter from `buildMaterialSwapPrompt` and from `StartMaterialSwapInput`; drop the `ADDITIONAL DIRECTION FROM USER` section.

### 2. `src/pages/MaterialSwap.tsx` — UI cleanup

- Delete the entire `Extra direction (optional)` block (label + Textarea, lines ~921–932) and remove the `userNote` state and import.
- Stop passing `userNote` to `startMaterialSwap`.
- Material row stays as-is (swatch + name input + remove).

### 3. No backend / pricing / schema changes

## Out of scope

- Per-material metadata UI
- Auto-detecting material name from the swatch
- Step 1 / Step 3 changes
