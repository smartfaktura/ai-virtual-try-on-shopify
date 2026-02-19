

## Fix: Scene Reference Should Also Guide Composition/Pose

### The Problem
The current prompt instructs the AI: "Use [SCENE IMAGE] ONLY for environment/backdrop reference." This means the AI correctly copies the lighting and shadows from the "Editorial Minimal" scene but completely ignores the side-profile pose and composition shown in it. The result is a front-facing shot in the right environment -- missing the key compositional feel of the scene.

### The Fix
Update the prompt in `supabase/functions/generate-tryon/index.ts` to tell the AI to replicate the **composition, pose direction, and framing** from [SCENE IMAGE] in addition to the environment -- while still preserving identity exclusively from [MODEL IMAGE].

### Changes

**File: `supabase/functions/generate-tryon/index.ts`** (lines ~131-132)

Replace the current environment block (when scene image is provided):

```
Before:
"Replicate the environment, lighting, backdrop, and composition shown in [SCENE IMAGE].
 Match the mood, color palette, and spatial depth.
 IMPORTANT: Use [SCENE IMAGE] ONLY for environment/backdrop reference.
 The person's identity, face, and body MUST come exclusively from [MODEL IMAGE].
 Do NOT take any identity or appearance cues from any person visible in [SCENE IMAGE]."
```

```
After:
"Replicate the environment, lighting, backdrop, composition, pose direction,
 and body positioning shown in [SCENE IMAGE]. Match the mood, color palette,
 spatial depth, camera angle, and the way the subject is posed (e.g. side profile,
 back turned, walking, leaning).
 IMPORTANT: The person's IDENTITY (face, skin tone, hair, body type) MUST come
 exclusively from [MODEL IMAGE]. Do NOT copy the face or appearance of any person
 in [SCENE IMAGE] -- only copy their pose, stance, and the environment around them."
```

Also update the `imageReferences` line (~139) to clarify both pose and environment come from the scene:

```
Before:
"the person from [MODEL IMAGE] wearing the clothing item from [PRODUCT IMAGE]
 in the environment shown in [SCENE IMAGE]"

After:
"the person from [MODEL IMAGE] wearing the clothing item from [PRODUCT IMAGE],
 posed and composed like [SCENE IMAGE] in that same environment"
```

And update the final reminder line (~167):

```
Before:
"The environment must match [SCENE IMAGE] but the person must NOT resemble
 anyone in [SCENE IMAGE]."

After:
"Match the pose, composition, and environment from [SCENE IMAGE],
 but the person's identity must come from [MODEL IMAGE] only."
```

### Why This Works
- The AI now knows to replicate the side profile, the stance, the camera angle from the scene
- Identity (face, skin, hair) still comes only from [MODEL IMAGE]
- The distinction is clear: copy the "what they're doing and where they are" from [SCENE IMAGE], but copy "who they are" from [MODEL IMAGE]

### Files to Edit
- `supabase/functions/generate-tryon/index.ts` -- update 3 sections of the `buildPrompt` function
- Redeploy the edge function

