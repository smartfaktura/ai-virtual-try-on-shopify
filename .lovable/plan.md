

## Fix Clean Studio Light nude output — prompt-only, no locks

### What changes

Update only the `prompt_template` for `scene_id='clean-studio-light'` in `product_image_scenes` (one SQL UPDATE). No code changes, no wardrobe lock, no fallback rewrites in `productImagePromptBuilder.ts`. Nothing else is touched, so swimwear / lingerie / hand-only / jewelry / fragrance / beauty / close-up scenes are completely unaffected.

### What's wrong with the current template

The current `clean-studio-light` template describes:
- "torso angled backward, supported by arms behind"
- "one leg bent upward, second leg extended forward/down"
- "skin: smooth, slightly luminous"
- "skin tones slightly warm to contrast cool environment"

It never mentions the product, never says "wearing", and has no `[PRODUCT]` / `{{personDirective}}` / `{{outfitDirective}}` token. The image model reads it as a bare-skin body study on a grey cube.

### The new template (prompt-only fix)

Rewrite so the scene:
- Opens with `[PRODUCT]` as the hero piece (also gives the auto-injector its preferred anchor).
- Inserts `{{personDirective}}` and `{{outfitDirective}}` near the top so wardrobe styling is woven in naturally.
- Replaces "torso angled backward… one leg bent upward… second leg extended…" with pose language that explicitly references the styled outfit and footwear (e.g. "model wearing the full outfit reclining on the cube, one leg bent, the other extended, garments and footwear clearly visible and correctly fitted").
- Removes "skin: smooth, slightly luminous" and "skin tones slightly warm to contrast cool environment" from the materials block — these are the lines actively pushing the model toward bare skin. Replace with "fabric texture, garment fit and styling clearly readable".
- Keeps every other line — studio, transparent cube, lighting, lens, color palette, depth of field, mood — exactly as-is so the visual identity of the scene is preserved.

### Files

```text
(SQL UPDATE)   product_image_scenes.prompt_template
               WHERE scene_id = 'clean-studio-light'
```

No code edits. No changes to `productImagePromptBuilder.ts`. No changes to other scenes.

### Out of scope
- No wardrobe lock / hardening logic in the builder.
- No edits to swimwear, lingerie, hand-focus, jewelry, fragrance, beauty, eyewear or any close-up template.
- No taxonomy, RLS, UI, or model changes.

### Expected result
- Clean Studio Light keeps the same minimal grey-cube editorial look.
- Model is fully dressed in the product (leggings, hoodies, denim, activewear, etc.).
- Zero risk of regressions on any other scene because nothing else is touched.

