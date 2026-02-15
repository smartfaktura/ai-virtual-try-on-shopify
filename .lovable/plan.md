

## Improve Creator Mood UI + Generate UGC Scene Previews

### 1. Enhance Creator Mood Selector

The current mood selector uses small text-based chips. We'll upgrade to a more visual, engaging grid layout with larger cards, bigger emojis, and better descriptions that help creators understand each mood's impact on their content.

**Changes to `src/pages/Generate.tsx`:**

- Update the `UGC_MOODS` array to include richer descriptions and a larger emoji display
- Switch from `flex-wrap` chip layout to a proper 2-3 column grid with taller cards
- Add a subtle "recommended" badge on "Excited" (most popular UGC vibe)
- Include a brief example of what the expression looks like (e.g., "Wide smile, bright eyes")
- Updated mood options:
  - Excited: "Wide smile, bright eyes. 'OMG I love this!' energy"
  - Chill: "Soft smile, relaxed gaze. Everyday casual vibe"
  - Confident: "Subtle smile, direct eye contact. 'I know what works' energy"
  - Surprised: "Raised eyebrows, open mouth. 'Wait, this actually works?!' reaction"
  - Focused: "Concentrated, friendly. Tutorial/demo mode"

### 2. Add UGC Scene Preview Prompts

Add all 16 Selfie/UGC variations to the `scenePreviewPrompts` dictionary in the `generate-scene-previews` edge function, so clicking "Regenerate Previews" generates proper preview images for each scene.

**Changes to `supabase/functions/generate-scene-previews/index.ts`:**

Add 16 new entries matching the variation labels:
- Golden Hour Selfie, Coffee Shop / Brunch, Car Selfie, Walking Street Style, Gym / Workout
- Morning Routine / GRWM, Bedroom Outfit Check, Couch / Netflix Chill, Kitchen Counter
- Unboxing Excitement, Haul / You Need This, Before / After Moment, POV Discovery, Testimonial / Review
- In-Use Close-up, Hands-Only Demo

Each prompt will describe the UGC scene with a diverse model (using existing `getModelDesc` cycling), iPhone front-camera selfie aesthetic, and the specific setting/mood of that variation -- without any product, since previews are product-agnostic showcases.

### Technical Details

**Files to modify:**
1. `src/pages/Generate.tsx` -- Lines 231-236 (mood data) and lines 1989-2017 (mood UI)
2. `supabase/functions/generate-scene-previews/index.ts` -- Add 16 UGC scene prompts to `scenePreviewPrompts` dictionary

**Deployment:** Edge function will be redeployed automatically. After deployment, an admin can click "Regenerate Previews" on the Selfie/UGC workflow settings step to generate all 16 scene preview images.

