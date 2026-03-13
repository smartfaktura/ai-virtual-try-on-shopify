

## Switch Upscale Models to Wonder

**Goal**: Replace `Standard V2` / `High Fidelity V2` with the `Wonder` generative model for both 2K and 4K tiers. Keep old config commented out for easy rollback.

**File**: `supabase/functions/upscale-worker/index.ts`

### Changes (lines 10-13)

Comment out the current `RESOLUTION_CONFIG` and replace with Wonder-based config:

```ts
// --- Previous config (kept for rollback) ---
// const RESOLUTION_CONFIG = {
//   "2k": { maxPx: 2048, label: "2K", model: "Standard V2", sharpen: 0.85, fix_compression: 0.6, denoise: 0.05, strength: 0.85, face_enhancement: true, face_enhancement_strength: 0.6, face_enhancement_creativity: 0.2 },
//   "4k": { maxPx: 4096, label: "4K", model: "High Fidelity V2", sharpen: 0.9, fix_compression: 0.65, denoise: 0.03, strength: 0.9, face_enhancement: true, face_enhancement_strength: 0.7, face_enhancement_creativity: 0.2 },
// };

const RESOLUTION_CONFIG = {
  "2k": { maxPx: 2048, label: "2K", model: "Wonder", sharpen: 0.5, fix_compression: 0.4, denoise: 0.03, strength: 0.85, face_enhancement: true, face_enhancement_strength: 0.6, face_enhancement_creativity: 0.3 },
  "4k": { maxPx: 4096, label: "4K", model: "Wonder", sharpen: 0.5, fix_compression: 0.4, denoise: 0.03, strength: 0.9, face_enhancement: true, face_enhancement_strength: 0.7, face_enhancement_creativity: 0.3 },
};
```

**Key differences with Wonder**:
- Wonder is a generative model — it intelligently adds detail rather than just sharpening pixels
- Lower `sharpen` and `fix_compression` values since Wonder handles these internally
- Slightly higher `face_enhancement_creativity` (0.3) to let the generative model enhance facial detail naturally
- Same `output_width` targets (2048/4096) and face enhancement enabled

**No other files change** — the rest of the pipeline (queue, polling, storage, UI) stays identical. To rollback, just uncomment the old config and comment the new one.

