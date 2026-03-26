

# Fix: Scene Composition/Perspective Not Being Replicated

## Problem
The scene reference instruction currently only asks the AI to match **lighting, color temperature, and atmosphere** from the scene image. It explicitly does NOT ask to replicate the **camera angle, composition, or framing perspective**.

For scenes like "Urban Taxi Ride" (shot from outside through the car window), the camera position IS the scene — without it, the AI improvises a completely different composition.

This was intentionally loosened previously to give the AI "creative freedom," but it went too far — the scene's core visual identity is lost.

## Solution
Add **composition and camera perspective matching** back into the scene reference instructions, but in a balanced way that preserves the scene's visual identity without being overly rigid.

## Changes

### File: `supabase/functions/generate-freestyle/index.ts`

**Update all three scene reference blocks (lines 226-234)** to include composition/perspective matching:

- **With model (line 228)**: Add "Replicate the camera angle, framing, and composition from the scene reference" to the existing lighting/environment instructions
- **On-model scene without explicit model (line 231)**: Same addition
- **Product-only / no model (line 233)**: Same addition

The updated instruction will read something like:

> SCENE: Place the person naturally INTO the environment shown in [SCENE REFERENCE]. **Replicate the camera angle, framing, and composition of the scene image** — if the scene shows a view through a window, shoot through that window; if it shows a low angle, use a low angle. Match the scene's lighting direction, color temperature, and ambient shadows...

This ensures the AI treats the scene image as a **composition blueprint**, not just a mood board.

### Scope
- 1 file: `supabase/functions/generate-freestyle/index.ts` — update 3 scene instruction strings
- Redeploy edge function
- No database changes

