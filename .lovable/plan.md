

## Fix Mirror Selfie Set: Clean Image + Updated Text

### Problem
1. The Mirror Selfie Set preview/background image has Instagram UI overlays (username "erinnasmith", verified badge, "1/2" slide counter, icons) that should not be visible
2. The description and bullet points reference specific counts ("8 diverse room and mirror environments") that need to be made generic

### Changes

#### 1. Generate a clean background image

Create a one-time edge function to generate a new mirror selfie preview image without any Instagram/social media UI elements -- just a clean photo of a woman taking a mirror selfie in a bedroom, wearing a brown sweater, holding a smartphone. Upload it to `landing-assets/workflows/workflow-mirror-selfie.jpg`, replacing the current image.

**Prompt**: "A young woman taking a mirror selfie in a cozy bedroom. She is wearing a beige/brown knit cropped sweater and light blue jeans. She holds a smartphone at chest level, capturing her reflection in a round gold-framed mirror. Warm natural light from sheer curtains, neutral bedding, jute rug. Clean photo, no text, no UI overlays, no watermarks, no social media interface. Professional lifestyle photography."

#### 2. Update database description

Run a migration to update the workflow description to be more generic:

**Before**: "Generate Instagram-style mirror selfie content featuring your product worn or held by a selected model. Realistic smartphone-in-hand compositions across 8 diverse room and mirror environments."

**After**: "Generate authentic mirror selfie content featuring your product worn or held by a selected model. Realistic smartphone-in-hand compositions across diverse room and mirror environments."

#### 3. Update feature bullet points

**File: `src/components/app/WorkflowCard.tsx`** (lines 44-49)

Update the featureMap for Mirror Selfie Set:

| Before | After |
|--------|-------|
| Realistic mirror selfie compositions with phone visible | Realistic mirror selfie compositions with phone visible |
| 8 room/mirror environments (bedroom, bathroom, elevator, gym...) | Diverse room and mirror environments to choose from |
| Identity-preserved model with your product | Identity-preserved model with your product |
| All aspect ratios supported | All aspect ratios supported |

Only the second bullet changes -- removing the specific count and room list.

#### 4. Clean up

Delete the one-time edge function after the image is generated and uploaded.
