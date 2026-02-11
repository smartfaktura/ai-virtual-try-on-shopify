

## Upgrade: Pro-Level Prompt Polish for Freestyle

### Problem

The current `polishUserPrompt` function produces generic quality instructions like:
- "Ultra high resolution, sharp focus, natural lighting, commercial-grade color accuracy"
- "Studio-grade portrait retouching — no plastic or airbrushed look"

These are too vague to produce high-end results. The reference prompts from ThePromptRoom show what actually works with Nano Banana — they include **7 specific layers** of detail that our polish completely lacks.

### What the Reference Prompts Do Differently

From analyzing the 6 screenshots, every high-quality prompt includes these patterns:

1. **Camera technical specs** — "shot on an 50 mm lens at f 2.8 ISO 400-800 1/125-200 s"
2. **Depth of field control** — "eyes and face tack-sharp while background recedes into gentle softness"
3. **Lighting architecture** — "large soft key, negative fill for deeper contour, subtle rim separation, sculpted shadows"
4. **Micro-texture realism** — "natural skin pores without harshness, fabric texture, hair sheen, specular highlights on glass and skin"
5. **Rich blacks and tonal control** — "rich blacks retaining detail, avoid clipping, preserve highlights, cinematic tonal depth"
6. **Composition language** — "clean silhouettes, generous negative space, minimal clutter, no added props"
7. **Editorial finishing** — "deep neutral shadows, refined contrast, subtle film-like grain, immaculate retouching, luxury editorial grade"

### Solution

Replace the generic quality instructions in `polishUserPrompt` with a structured "Photography DNA" block that injects these 7 layers automatically. This applies to the **Pro camera style** (default). The Natural/iPhone style keeps its existing instructions.

### Changes

#### `supabase/functions/generate-freestyle/index.ts`

**1. Add a new `buildPhotographyDNA` helper function** that returns the pro-level rendering instructions. This block is injected into every polished prompt when `cameraStyle !== 'natural'`:

```
PHOTOGRAPHY DNA:
- LENS: shot on a 50 mm lens at f 2.8, ISO 400, 1/125 s. Shallow depth of field —
  subject's eyes and face tack-sharp while background recedes into gentle creamy softness.
- LIGHTING ARCHITECTURE: Large soft key from camera-left, minimal warm fill,
  negative fill to sculpt cheek and jaw shadows, faint warm rim from behind for
  shoulder separation. Controlled specular highlights on skin and fabric without clipping.
- MICRO-TEXTURE REALISM: Render premium micro-texture — natural skin pores and
  peach-fuzz without harshness, individual hair strands with natural flyaways,
  fabric weave and nap, smooth specular sheen on satin/glass/metal surfaces.
  Crisp lashes, glossy lips, realistic material properties throughout.
- TONAL CONTROL: Rich blacks retaining full shadow detail. Protect highlights —
  no blown areas. Warm amber midtones, deep neutral shadows. Cinematic tonal depth
  with natural skin tones preserved. Avoid any digital harshness.
- COMPOSITION: Clean silhouette, generous negative space, minimal clutter,
  no added props or distracting elements. Strong diagonals or rule-of-thirds
  placement. Intentional, editorial-grade framing.
- FINISHING: Luxury editorial grade — refined contrast, subtle film-like grain,
  immaculate retouching with natural realism preserved. Deep neutral shadows,
  elegant highlight roll-off, delicate color separation.
```

**2. Replace the generic quality line** in the standard (non-selfie, non-multi-ref) path:

| Before | After |
|--------|-------|
| `"Ultra high resolution, sharp focus, natural lighting, commercial-grade color accuracy."` | `buildPhotographyDNA()` output |

**3. Replace the generic portrait quality line** for model shots:

| Before | After |
|--------|-------|
| `"PORTRAIT QUALITY: Natural and realistic skin texture, accurate body proportions, natural pose and expression. Studio-grade portrait retouching — no plastic or airbrushed look."` | More specific instructions: natural skin pores and peach-fuzz, crisp lashes, realistic hair texture, smooth luminous skin with clean highlight roll-off, no heavy frequency-separation retouching |

**4. Upgrade the condensed multi-ref quality line** (line 122):

| Before | After |
|--------|-------|
| `"Quality: Ultra high resolution, sharp focus, natural lighting, commercial-grade."` | `"Quality: shot on 50mm at f 2.8. Shallow DOF, subject sharp, background soft. Sculpted lighting with negative fill. Premium micro-texture: skin pores, fabric weave, hair strands. Rich blacks with detail, no clipping. Subtle film grain, editorial finishing."` |

**5. No changes to Natural/iPhone camera style** — it already has its own detailed rendering block. The Photography DNA only applies to "pro" (default) camera style.

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/generate-freestyle/index.ts` | Add `buildPhotographyDNA()` helper; replace generic quality instructions with pro-level photography DNA in 3 locations (standard path, portrait quality, condensed multi-ref) |

### Result

Every polished freestyle generation with Pro camera style will automatically include the same level of photographic detail that produces viral-quality results on social media — specific lens/aperture specs, lighting architecture, micro-texture rendering, tonal control, composition rules, and editorial finishing.

