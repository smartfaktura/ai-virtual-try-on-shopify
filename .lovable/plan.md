

## Improve Topaz Upscaling Quality — More Texture, Less "AI Look"

### Problem
Currently we send minimal parameters to Topaz — just `model`, `output_width`, and `output_format`. This uses default settings which can produce smooth, plastic-looking results typical of AI upscaling.

### What Topaz Offers
The Topaz API supports several tuning parameters we're not using:

- **`sharpen`** — sharpens the output (0–1)
- **`fix_compression`** — reduces compression artifacts (0–1)
- **`denoise`** — noise reduction (0–1, lower = preserves grain/texture)
- **`strength`** — overall model strength (0.01–1, too high = unrealistic)

### Plan — 1 file

**`supabase/functions/upscale-worker/index.ts`**

1. **Add quality parameters to the form data** sent to Topaz, tuned for photorealistic texture retention:

```
sharpen: 0.6        — moderate sharpening for crisp detail
fix_compression: 0.5 — clean up JPEG artifacts from source
denoise: 0.15        — very low denoising to preserve natural grain/texture
strength: 0.75       — strong enough to enhance but not over-process
```

2. **Use different tuning per resolution**:
   - **2K**: slightly lower strength (0.7) since less upscaling needed
   - **4K**: higher strength (0.8) + slightly more sharpening (0.7) for the bigger scale factor

These parameters get appended as form-data fields alongside the existing `model`, `output_width`, and `output_format`.

### Technical Detail

The `RESOLUTION_CONFIG` object will be extended to include these parameters, and they'll be appended to the `formData` before submission:

```typescript
const RESOLUTION_CONFIG = {
  "2k": { 
    maxPx: 2048, label: "2K", model: "Standard V2",
    sharpen: 0.6, fix_compression: 0.5, denoise: 0.15, strength: 0.7
  },
  "4k": { 
    maxPx: 4096, label: "4K", model: "High Fidelity V2",
    sharpen: 0.7, fix_compression: 0.5, denoise: 0.1, strength: 0.8
  },
};
```

No frontend changes needed — this is purely a backend quality improvement.

