

# Improve Video Prompts with Kling v3 Cinematic Language + Add More Camera Motions

## Problem
Current camera prompts use abstract mechanical language ("the camera physically orbits around the subject") that Kling v3 poorly interprets. The official Kling v3 guide shows the model responds to **cinematic shot vocabulary** — "low-angle tracking shot", "the camera orbits in slow motion capturing the play of light", "frontal medium shot, tracking backward". We also only have 6 camera motions, missing common cinematic moves like dolly zoom, tilt up/down, crane, and tracking shots.

## Key Learnings from Kling v3 Guide
1. Use **natural cinematic language**, not robotic instructions
2. Describe **what the camera reveals** as it moves, not just the motion itself
3. Include shot framing terms: "medium shot", "close-up", "wide shot"
4. Timestamp-based cues work for longer clips ("At the 4th second, the camera...")
5. Negative phrasing ("do NOT rotate") is weak — positive framing works better
6. The model understands complex multi-action camera choreography in a single prompt

## Changes

### File 1: `src/lib/videoMotionRecipes.ts` — Add new camera motions
Add 4 new camera options to the `CAMERA_MOTIONS` array:
- **`dolly_zoom`** — "Dolly Zoom" (dramatic perspective shift)
- **`tilt_reveal`** — "Tilt Reveal" (vertical tilt up from product to scene)
- **`tracking_follow`** — "Tracking Follow" (lateral tracking alongside subject)
- **`crane_up`** — "Crane Up" (rising overhead establishing shot)

Update relevant motion goals in the `CATEGORY_SCENE_MOTION_MATRIX` to include these new options where appropriate (e.g., `crane_up` for home_decor/interior_room, `tracking_follow` for fashion/action_scene).

### File 2: `src/lib/videoPromptTemplates.ts` — Rewrite all camera phrases
Replace all `CAMERA_PHRASES` with cinematic descriptions that match Kling v3's training language:

```typescript
const CAMERA_PHRASES: Record<string, string> = {
  static: 'locked-off static camera on a tripod, no camera movement whatsoever',
  slow_push_in: 'the camera slowly dollies forward on a smooth track, 
    gradually tightening the frame from a medium shot to a close-up, 
    revealing finer details as it approaches',
  gentle_pan: 'smooth horizontal camera pan gliding left to right across 
    the scene, revealing the full composition in one continuous sweep',
  camera_drift: 'handheld camera with a subtle floating drift, 
    gently swaying as if carried on a slow breath',
  premium_handheld: 'cinematic handheld camera with natural micro-shake, 
    like a steadicam operator walking alongside the subject',
  orbit: 'the camera smoothly orbits around the subject in a continuous 
    arc, gradually changing the viewing angle from front to side to back, 
    capturing the subject from every angle as the background shifts behind 
    them — like a steadicam operator walking in a circle around a 
    stationary subject',
  dolly_zoom: 'dramatic dolly zoom effect — the camera moves forward while 
    the focal length widens, creating an unsettling perspective shift 
    around the subject',
  tilt_reveal: 'the camera tilts smoothly upward from a low angle starting 
    at the base of the subject, gradually revealing the full height and 
    scene above',
  tracking_follow: 'lateral tracking shot moving alongside the subject, 
    keeping them centered in frame as the background slides past',
  crane_up: 'the camera rises smoothly overhead like a crane shot, 
    starting at eye level and lifting to reveal the full scene from above',
};
```

### File 3: `src/lib/videoPromptTemplates.ts` — Improve prompt structure
- Move the camera clause **earlier** in the prompt (before preservation) so the model prioritizes it
- Add a framing/composition hint to the camera clause (e.g., "medium shot tightening to close-up")
- Remove the "The subject does NOT rotate" negative phrasing from orbit — replace with positive "the subject remains perfectly stationary while the viewing angle changes"

### File 4: `src/components/app/video/MotionRefinementPanel.tsx`
- No changes needed — it already renders from `CAMERA_MOTIONS` array dynamically

## Summary
- 4 new camera motion options (dolly zoom, tilt reveal, tracking follow, crane up)
- All camera phrases rewritten in cinematic vocabulary matching Kling v3's training
- Prompt structure improved: camera instruction placed earlier, positive framing replaces negative phrasing

