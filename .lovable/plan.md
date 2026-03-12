

## Improve Upscale Worker: Switch to Pro Model + Enhanced Prompt Engineering

### Why Pro over Flash

You're right. `google/gemini-3-pro-image-preview` (Nano Banana Pro) is the top-tier image generation model — described as "next-generation image generation model" with superior output quality. For upscaling where fidelity is paramount, Pro is the correct choice. Flash is better suited for speed-sensitive tasks, not quality-critical reproduction.

### Changes — 1 file

**`supabase/functions/upscale-worker/index.ts`**

1. **Switch model** from `google/gemini-3.1-flash-image-preview` → `google/gemini-3-pro-image-preview`

2. **Rewrite the prompt** with professional upscaling directives:
   - Explicit instruction to enhance resolution while preserving every pixel-level detail
   - Sharpness directives borrowed from the generation engine: micro-contrast, visible material textures, fine stitching detail
   - Explicit anti-hallucination guard: do not add, remove, or alter any element
   - Request maximum output resolution PNG with lossless quality
   - Resolution-specific language (2K = 2048px, 4K = 4096px on longest edge)

3. **Increase timeout** from 90s → 120s since Pro model is slower than Flash

### New prompt (draft):

```
You are a professional image upscaler. Take this image and output the EXACT same image 
at {targetPx}px on its longest edge as a high-resolution PNG.

CRITICAL RULES:
- Preserve EVERY detail: composition, colors, lighting, shadows, reflections, framing
- Do NOT add, remove, change, or hallucinate any element
- Do NOT crop, reframe, or alter the aspect ratio
- Enhance sharpness: visible material textures, fine stitching, micro-contrast on skin
- Maximize detail clarity on edges, text, patterns, and fine structures
- Output as lossless PNG at the highest possible quality
- The result must be indistinguishable from the original except at higher resolution
```

