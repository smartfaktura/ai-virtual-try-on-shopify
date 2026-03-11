

## Sharpness Improvements — 2 Targeted Edits

### File: `supabase/functions/generate-freestyle/index.ts`

**1. Line 87 — Photography DNA**
- Change `85mm f/1.4` → `85mm f/2.8` for deeper focus and sharper detail
- Add "visible material textures and fine stitching"
- Remove "ultra high resolution" (vague), replace with "razor-sharp focus, micro-contrast"
- **No "8K resolution"** — API doesn't support that output

New string:
```
"Shot on 85mm f/2.8 lens, fashion editorial quality. Professional studio lighting with sculpted shadows. Razor-sharp focus, micro-contrast. Natural skin texture, visible material textures and fine stitching. Subtle film grain, elegant highlight roll-off."
```

**2. Lines 301-302 — Portrait quality block**
- Add "Razor-sharp eye detail with individual eyelash rendering" at the start
- Add "Micro-contrast on skin texture" before the existing pores/peach-fuzz line

New string:
```
"PORTRAIT QUALITY: Razor-sharp eye detail with individual eyelash rendering. Micro-contrast on skin texture — natural pores and peach-fuzz visible without harshness. Crisp lashes, realistic hair texture with individual strands. Smooth luminous skin with clean highlight roll-off. Accurate body proportions, natural pose and expression. No heavy frequency-separation retouching, no plastic or airbrushed look."
```

### Summary
One file, two string edits. Edge function auto-deploys.

