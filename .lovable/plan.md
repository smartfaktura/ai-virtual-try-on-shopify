

## Fix: Remove Camera UI Icons from Selfie/UGC Set Generations

### Root Cause

The prompt template tells the AI "The camera IS the phone" and "shot FROM the smartphone front-facing camera," which causes the model to literally render iPhone camera app UI elements (shutter button, camera switch icon). The instruction "Leave slight space at top/bottom for potential text overlay" further encourages the AI to place UI widgets there.

### Fix (Database Migration)

Update the `selfie-ugc-set` workflow `generation_config.prompt_template`:

1. **Remove** "The camera IS the phone -- the viewer sees exactly what the iPhone front camera captures" — too literal
2. **Reword** the camera line to: "Shot as if taken with a smartphone front-facing camera. First-person selfie perspective. The subject is looking directly at the viewer."
3. **Remove** "Leave slight space at top/bottom for potential text overlay or caption area" — triggers UI element rendering
4. **Add to negative prompts**: `camera UI, shutter button, camera icon, phone interface, camera app overlay, viewfinder, on-screen controls, UI elements`

### Files Changed
- Database migration only — update `workflows` table `generation_config` for `selfie-ugc-set`

