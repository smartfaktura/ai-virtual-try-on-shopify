

## Fix: Remove Bokeh-Inducing Language from Selfie/UGC Set Prompts

### Root Cause

Multiple prompt sources are fighting each other:

1. **Variation instructions** (stored in DB `generation_config`) use "blurred" language in scene descriptions:
   - "Golden Hour Selfie": `blurred outdoor greenery or cityscape bathed in warm light`
   - "Coffee Shop / Brunch": `other tables slightly blurred`
   - "Car Selfie": `blurred windshield view`
   - Multiple others mention "blurred" or "slightly blurred"

2. **Scene preview prompts** (`generate-scene-previews/index.ts` line 113): Golden Hour Selfie explicitly says `soft bokeh background`.

3. The prompt_template correctly says "NOT Portrait Mode. Deep depth of field" and the negatives include "shallow depth of field, bokeh" — but these are being overridden by the variation-level "blurred" instructions that the AI model prioritizes.

The AI interprets "blurred background" as a cue to create bokeh/shallow depth of field, which contradicts the iPhone front-camera aesthetic.

### Fix

**1. Update variation instructions in DB** (migration)
Replace all "blurred" references in selfie-ugc-set variation instructions with specific, neutral descriptions:
- `blurred outdoor greenery or cityscape` → `outdoor greenery or cityscape in the distance`
- `other tables slightly blurred` → `other tables visible in the background`
- `blurred windshield view` → `windshield view of the road ahead`
- Any other "blur" mentions → sharp environmental descriptions

**2. Fix scene preview prompt** (`generate-scene-previews/index.ts`)
- Line 113: Remove `soft bokeh background` from "Golden Hour Selfie", replace with `trees or cityscape visible in the background`

**3. Add explicit anti-bokeh reinforcement to prompt_template** (DB migration)
Add to the CAMERA section: `Everything in the frame must be in sharp focus — foreground and background alike. No bokeh, no background blur, no shallow depth of field effect.`

### Files Changed
- `supabase/functions/generate-scene-previews/index.ts` — remove bokeh from Golden Hour Selfie prompt
- Database migration — update `selfie-ugc-set` workflow `generation_config` to remove blur language from variations and reinforce sharp focus in prompt_template

