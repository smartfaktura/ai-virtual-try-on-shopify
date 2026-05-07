## Rewrite Tennis Editorial Prompts + Add Missing Configuration

### Problems identified

1. **Empty `trigger_blocks`** — All 6 scenes have `[]`, which means the model picker, outfit system, and styling controls won't activate properly. Other activewear scenes use `[personDetails sceneEnvironment stylingDetails visualDirection layout]`.

2. **Missing `outfit_hint`** — All 6 scenes have null outfit hints, so the outfit system has no guidance for tennis-appropriate styling (shoes, accessories, layers).

3. **Prompt quality** — Current prompts are overly generic with static color grading instructions. They don't leverage dynamic tokens or match the quality/structure of the best activewear Editorial Sport Poses prompts. They also lack the product-dynamic integration (compression zones, stretch behavior, fabric tension under movement) that makes the editorial sport prompts work.

### Changes per scene

#### All 5 with-model scenes
- Set `trigger_blocks` to `{personDetails,sceneEnvironment,stylingDetails,visualDirection,layout}`
- Add tennis-specific `outfit_hint`

#### Racket & Gear Flat Lay (product-only)
- Set `trigger_blocks` to `{sceneEnvironment,stylingDetails,visualDirection,layout}` (no personDetails)
- No outfit_hint needed

#### Prompt rewrites (all 6)

Each prompt will be rewritten to:
- Lead with stronger `[MODEL IMAGE]` / `[PRODUCT IMAGE]` fidelity directives matching the editorial sport pose standard
- Add product-dynamic language: realistic compression zones, stretch behavior at knees/hips/shoulders, fabric tension under athletic movement, visible seam stress
- Include film color grading as a concise paragraph (not the dominant focus)
- Reference tennis-specific body mechanics (serve stance, baseline ready position, net approach stride)
- Keep the "no text, no clutter, no fake smooth skin" safeguards
- Use `{{productName}}` token consistently
- Add outfit integration language that works with the outfit_hint system

### No frontend changes needed
