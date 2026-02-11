

## Fix: True First-Person iPhone Selfie Perspective

### Problem
The current selfie prompt produces images where the model appears to be photographed BY someone else, or is holding a phone as a prop in-frame. A real selfie means the viewer IS the phone camera — the subject looks directly at the lens, the perspective is from the phone's point of view, and no phone device should be visible in the image.

### Solution
Rewrite the SELFIE COMPOSITION layer in `supabase/functions/generate-freestyle/index.ts` to enforce a true first-person camera perspective:

**Key changes to the prompt instructions:**
- The camera IS the phone. The viewer sees what the front-facing camera sees. No phone device should ever appear in the frame.
- The subject looks directly into the camera lens (eye contact with the viewer).
- Slight wide-angle lens distortion typical of smartphone front cameras.
- One arm is extended toward the camera (holding the phone, which is the camera itself) — this arm may be partially visible at the very bottom/side edge of the frame, but the phone is never visible because it IS the viewpoint.
- Explicitly forbid: no phone visible in frame, no "person holding a phone" composition, no third-person photography perspective.

### File Changed

| File | Change |
|------|--------|
| `supabase/functions/generate-freestyle/index.ts` | Rewrite the SELFIE COMPOSITION layer (line 90-91) to enforce first-person iPhone camera perspective |

### Updated Prompt (line 91)

Replace the current SELFIE COMPOSITION with:

```
SELFIE COMPOSITION: This image is shot FROM the smartphone's front-facing camera.
The camera IS the phone — the viewer sees exactly what the iPhone front camera
captures. The subject is looking DIRECTLY into the camera lens (direct eye contact
with the viewer). Slight wide-angle distortion typical of a smartphone selfie lens.
The subject's arm holding the phone may be partially visible at the bottom or side
edge of the frame, but the phone itself is NEVER visible because it IS the camera.
ABSOLUTELY NO phone, smartphone, or device should appear anywhere in the image.
This is NOT a third-person photo of someone holding a phone — it is the phone's
own POV. Soft natural smartphone-style bokeh in background. Authentic, candid
expression — relaxed and genuine.
```

This ensures the AI understands: "you are the phone camera" rather than "generate a photo of someone with a phone."

