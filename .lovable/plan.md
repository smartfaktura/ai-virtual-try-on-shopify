

## Further Improve Topaz Upscaling — More Realistic & Sharp

The Topaz API has several additional parameters we're not using yet. Based on their docs, here's what we can add:

### Changes — 1 file

**`supabase/functions/upscale-worker/index.ts`**

1. **Enable face enhancement** — Topaz has a built-in face recovery model that sharpens faces realistically:
   - `face_enhancement`: `true`
   - `face_enhancement_strength`: `0.6` (2K) / `0.7` (4K) — moderate to avoid over-processing
   - `face_enhancement_creativity`: `0.2` — keep it realistic, not creative

2. **Switch 4K to a generative model** — Topaz offers "Enhance Generative" models that reconstruct detail rather than just interpolating pixels. For the bigger 4K upscale, switching to a generative model will produce significantly sharper, more realistic results:
   - 4K model: `"Standard V2"` → `"High Fidelity V2"` (already set, but we can also try their generative models if available on your plan)

3. **Add `detail` parameter** — Available on some models, controls level of added detail after rendering:
   - `detail`: `0.7` (2K) / `0.8` (4K)

4. **Add `texture` parameter** — Adds realistic surface texture back into the image:
   - `texture`: `1` (recommended for realistic output at low creativity)

5. **Update `RESOLUTION_CONFIG` type** to include the new fields and append them to formData.

### Updated Config

```typescript
const RESOLUTION_CONFIG = {
  "2k": {
    maxPx: 2048, label: "2K", model: "Standard V2",
    sharpen: 0.85, fix_compression: 0.6, denoise: 0.05, strength: 0.85,
    face_enhancement: true, face_enhancement_strength: 0.6, face_enhancement_creativity: 0.2,
  },
  "4k": {
    maxPx: 4096, label: "4K", model: "High Fidelity V2",
    sharpen: 0.9, fix_compression: 0.65, denoise: 0.03, strength: 0.9,
    face_enhancement: true, face_enhancement_strength: 0.7, face_enhancement_creativity: 0.2,
  },
};
```

Note: `detail` and `texture` parameters are only available on Topaz's generative models. If your Topaz plan supports generative models, we can also switch to those for even better results. The face enhancement parameters work on all models and will be the biggest improvement for fashion/model imagery.

