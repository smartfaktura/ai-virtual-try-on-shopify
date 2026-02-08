

## Add Framing & Composition Control to Freestyle Generation

### Problem
The AI model sometimes positions the subject too low in the frame, cutting off the head or leaving too much empty space above/below. There are no explicit framing instructions in the current prompt engineering telling the AI where to place the subject.

### What Changes

Add **automatic framing instructions** to the `generate-freestyle` edge function that ensure proper subject positioning based on the type of shot being generated.

### Technical Details

**File: `supabase/functions/generate-freestyle/index.ts`**

1. **Add a FRAMING layer when a model/person is involved** (`context.hasModel` is true or the prompt mentions a person):

   For **selfie shots** (when `isSelfie` is true), update the SELFIE COMPOSITION layer to include:
   - "Subject's full head and hair must be fully visible within the frame with natural headroom above"
   - "Frame from mid-chest or shoulders upward -- do NOT crop below the chin or above the forehead"
   - "Center the face in the upper-third of the frame following the rule of thirds"

   For **standard portrait/model shots** (non-selfie, but has model reference), add a new FRAMING layer:
   - "FRAMING: Ensure the subject's full head, hair, and upper body are fully visible within the frame. Leave natural headroom above the head -- do NOT crop the top of the head. Position the subject using the rule of thirds. The face and eyes should be in the upper third of the composition."

2. **Add framing guidance for product-only shots** (no model, has source product):
   - "FRAMING: Center the product with balanced negative space on all sides. The product should occupy 50-70% of the frame with no cropping of edges."

These instructions are automatically applied during prompt polish -- no UI changes needed. The framing will improve for all future generations without users needing to manually specify it.

### Summary of Changes

| Shot Type | New Framing Instruction |
|---|---|
| Selfie (with person) | Full head visible, face in upper-third, frame from shoulders up |
| Portrait (with model ref) | Full head + hair visible, proper headroom, rule of thirds |
| Product only | Centered, 50-70% frame, no edge cropping |

One file changed: `supabase/functions/generate-freestyle/index.ts`
