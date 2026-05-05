
# Improve All Scarves Scene Prompts for Design Fidelity

## Problem
Scarves scene prompts allow the AI to hallucinate text, logos, and altered design patterns. The packshot scenes (front-view, angle-view, side-view, top-view, in-hand, low-angle) have weak or missing design-preservation directives. Editorial scenes have good structure but lack explicit anti-hallucination rules for text/logos.

## Solution
Add a standardized **DESIGN FIDELITY** block to every scarves scene prompt via a single DB migration. This block will be injected near the top of each prompt (after the opening product image reference line) to ensure:

1. **Exact pattern replication** — print scale, repeat spacing, motif placement, border widths, color palette all cloned pixel-for-pixel from the reference
2. **Zero text/logo hallucination** — if the original has text or logos, reproduce them exactly; if it has none, generate none
3. **Material accuracy** — render the correct textile behavior (silk sheen, cashmere matte, wool texture) based on the `{{material}}` token injected by the prompt builder
4. **Proportional integrity** — no element may be enlarged, shrunk, repositioned, or stylized vs. the reference

### The universal block (appended to every prompt):

```
[DESIGN PATTERN FIDELITY — CRITICAL]
The scarf's surface design is the product. Treat [PRODUCT IMAGE] as the ONLY ground truth for every visual element:
- Reproduce the exact print pattern, motif shapes, repeat scale, and spacing. No element may be larger, smaller, repositioned, or reinterpreted.
- Match the exact color palette — every hue, saturation, and tonal relationship must be cloned from the reference. Do not shift, brighten, mute, or harmonize colors.
- Replicate border widths, edge treatments, and fringe length precisely as shown.
- If the reference contains text, logos, monograms, or brand marks: reproduce them EXACTLY — same font, size, spacing, position, and color. Do NOT invent, translate, stylize, or omit any character.
- If the reference contains NO text or logos: generate NONE. Do not add any text, letters, symbols, watermarks, or brand marks.
- Render the fabric as {{material}} with physically accurate behavior: correct sheen, drape weight, fold memory, and surface texture for that textile.
- Never add patterns, textures, embellishments, or design elements that do not exist in the reference image.
```

### Specific improvements per scene group

**Packshot scenes** (front-view, angle-view, side-view, top-view, low-angle): Currently have minimal fidelity language. Will get the full block plus strengthened existing lines.

**Close-up / detail scene**: Will emphasize that the macro crop must show the actual weave/print from the reference, not a generic texture.

**In-hand / lifestyle scenes**: Block added to reinforce that styling context must not alter or obscure the design.

**Editorial on-model scenes** (headscarf, knot, blazer, etc.): Already have good structure. Block will replace the existing generic fidelity paragraph with the stronger version.

**Still-life scenes** (folded stack, perfume tray, bag handle): Block ensures folded/draped presentations still show accurate pattern alignment at fold edges.

**Packaging scenes**: Block ensures the scarf portion maintains fidelity even when shown alongside packaging.

## Implementation

Single DB migration updating `prompt_template` for all 30 active scarves scenes. Each scene keeps its unique composition/lighting/mood instructions but gains the standardized fidelity block.

The migration will use individual `UPDATE` statements per scene to append or replace the fidelity section, keeping each prompt's creative direction intact while adding the anti-hallucination and pattern-accuracy rules.
