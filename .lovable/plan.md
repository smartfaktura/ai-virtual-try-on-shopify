

# Rewrite On-Model Shot Prompts for ASOS/Zalando Studio Catalog Standard

## Problem

Current prompts describe poses loosely ("relaxed natural lifestyle pose", "candid energy", "touching hair"). Real catalog photography (ASOS, Zalando, H&M) uses very specific, repeatable camera and body positions — straight-on camera, fixed distance, consistent framing, minimal pose variation. The current prompts produce editorial/lifestyle results instead of clean e-commerce catalog shots.

## What ASOS/Zalando catalog shots actually look like

- **Camera**: Always straight-on at chest height, never angled up/down
- **Distance**: Fixed — full body shows head to ankles with ~10% padding
- **Background**: Perfectly uniform, zero texture
- **Pose energy**: Minimal — slight weight shift at most, no dramatic gestures
- **Arms**: Always visible, never hidden behind body
- **Expression**: Neutral or slight smile, always looking at camera (front shots)
- **Lighting**: Flat, even, shadowless on background — only subtle body shadow

## Changes per shot

### On-Model Shots — rewrite all `promptTemplate` values:

| Shot | Current Issue | New Direction |
|------|--------------|---------------|
| `front_model` | "weight on left leg, right hand relaxed" — too specific about which leg/hand | "Standing straight facing camera, feet hip-width apart, arms naturally at sides, straight-on eye-level camera angle, flat e-commerce catalog pose" |
| `back_view` | "head turned slightly to the right" — arbitrary direction | "Standing straight facing away from camera, feet hip-width apart, head facing forward (away), arms at sides, straight-on camera" |
| `side_3q` | "body turned 45 degrees to the left" — could be either way | "Standing in 3/4 turn, body angled 30-45 degrees, near arm visible, far arm partially visible, straight-on camera at chest height" |
| `movement` | "mid-stride walking motion, arms swinging" — too dynamic | "Mid-stride walking pose, one foot slightly ahead, subtle natural arm swing, controlled movement, NOT running, NOT jumping" |
| `sitting` | "legs crossed at ankles, hands resting on thighs" — too posed | "Seated on minimal stool, back straight, feet flat on floor, hands on knees or lap, relaxed upright posture" |
| `full_look` | "editorial pose, slight weight shift to one hip, one hand on hip" — editorial not catalog | "Full outfit view, standing straight, arms at sides or one hand lightly at side, clean catalog pose showing complete styling" |
| `lifestyle_context` | "candid energy, one hand in pocket or touching hair" — lifestyle, not studio | "Relaxed standing pose, slight weight shift, one hand in pocket, composed studio catalog feel, NOT candid, NOT outdoor" |
| `over_shoulder` | "head turned 30 degrees showing profile" — fine but needs studio framing | "Back toward camera, looking over shoulder toward camera, straight-on camera, clean studio framing" |
| `waist_up_crop` | Mostly fine | Add "straight-on camera at chest height, centered frame, catalog crop" |
| `walking_motion` | Duplicate of `movement` | "Natural walking step, subtle stride, front-facing camera, clean studio motion capture" |
| `hands_detail` | "adjusting collar or hem" — vague | "Hands interacting with product — adjusting collar, cuff, or hem — tight crop on hands and product detail" |

### Key prompt additions for ALL on-model shots:

```
STUDIO CATALOG RULES:
- Camera is ALWAYS straight-on at chest height, perfectly level, never tilted
- Camera distance is fixed: full body = head to feet with 10% padding top/bottom
- The model stands on the SAME spot every shot — centered in frame
- Pose is MINIMAL and CONTROLLED — this is e-commerce catalog, NOT editorial
- Expression: neutral composed or slight natural smile
- NO dramatic gestures, NO fashion editorial energy, NO lifestyle mood
- Background must be PERFECTLY UNIFORM with zero visible texture or gradient
```

### Identity anchor — also tighten:
Add studio catalog framing rules to the anchor prompt so the anchor itself looks like a catalog waist-up shot, not an editorial portrait.

## Files to update

- `src/lib/catalogEngine.ts` — Rewrite all on-model `promptTemplate` strings + add a shared `STUDIO_CATALOG_RULES` block appended to every on-model prompt in `assemblePrompt()`

## Expected result
- Every on-model shot produces ASOS/Zalando-grade straight-on studio catalog photography
- Consistent camera angle, distance, and framing across all shots in a batch
- No more lifestyle/editorial drift in catalog mode

