

## Fix: Natural Camera Style Conflicting with Selfie Bokeh

### Problem
The selfie composition layer (line 93) explicitly instructs: **"Soft natural smartphone-style bokeh in background"**. This fires BEFORE the Natural camera style layer, so the AI prioritizes it and produces blurry backgrounds even when Natural mode is selected.

Real iPhone selfies (without Portrait Mode) have a **deep depth of field** — the background is mostly sharp, maybe slightly softer at extreme distance, but never the creamy bokeh you see in the generated images.

### Solution
Make the selfie composition layer conditional on `cameraStyle`:

1. **When Natural**: Remove bokeh instruction, replace with "deep depth of field, background mostly sharp and in focus — like iPhone front camera WITHOUT Portrait Mode enabled"
2. **When Pro** (default): Keep the existing "Soft natural smartphone-style bokeh" for the polished commercial look

Also strengthen the Natural camera style layer itself to explicitly override any remaining bokeh tendencies when combined with selfie mode.

### File Changed

| File | Change |
|------|--------|
| `supabase/functions/generate-freestyle/index.ts` | Make selfie composition bokeh conditional on cameraStyle; strengthen Natural layer for selfie context |

### Technical Details

**1. Update selfie composition (line 86-97)** — pass `cameraStyle` into the selfie block:

- When `cameraStyle === 'natural'`: selfie composition says "Deep depth of field — background is sharp and in focus, NOT blurred. This is a standard front-camera selfie WITHOUT Portrait Mode. No bokeh, no background blur."
- When `cameraStyle === 'pro'` (default): keeps current "Soft natural smartphone-style bokeh in background"

**2. Update Natural camera style layer (line 177-187)** — add selfie-specific override:

Add to the Natural layer: "If this is a selfie, it is shot with the standard front-facing camera mode (NOT Portrait Mode). The background must remain sharp and detailed — no depth-of-field blur whatsoever."

This two-pronged approach ensures both the selfie layer and the camera style layer agree on the same rendering, leaving no room for the AI to default to bokeh.
