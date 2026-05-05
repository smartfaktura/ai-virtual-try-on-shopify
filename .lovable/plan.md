## Problem

1. Closeup/detail/texture scenes across all categories don't include the product's material in the prompt. For scarves specifically, the AI doesn't know it's silk so it renders a generic fabric texture.
2. Scarves product spec fields only have Length and Width — no Material selector.
3. ~130 closeup/detail/texture scenes across 38 categories all lack `{{materialTexture}}` token.

## Solution

Rather than updating 130+ scene templates individually, the fix adds automatic material injection at the prompt builder level (same pattern used for product dimensions).

### 1. Add Material field to scarves spec fields (`src/lib/productSpecFields.ts`)

Add a `material` comboInput field with options like Silk, Cashmere, Wool, Cotton, Linen, Modal, Viscose, Polyester blend.

### 2. Auto-inject material into all closeup/detail/texture scenes (`src/lib/productImagePromptBuilder.ts`)

After the specification injection block (~line 1406), add a material injection block that:
- Checks if the template already contains `{{materialTexture}}`
- If not, and material info is available (from analysis or product specs), injects a `[MATERIAL] The product material is X — render accurate X texture, sheen, drape, and surface quality.` block
- Triggers on scene_id patterns: `closeup`, `detail`, `texture`, `macro`, `hardware`

This ensures ALL closeup scenes automatically get material context without touching any scene templates.

### 3. Also inject material from product specs into the analysis context

In `productImagePromptBuilder.ts`, parse the serialized specs for a "Material" field and use it to override or supplement `analysis.materialFamily` so user-specified material takes priority.
