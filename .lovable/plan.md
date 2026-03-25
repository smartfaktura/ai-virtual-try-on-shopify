

# Brand Models Page — Unified Generator & Improved UX

## Current State
- Uses `google/gemini-3-pro-image-preview` for image generation (good quality model)
- Uses `google/gemini-2.5-flash` for reference analysis
- Two separate tabs: "From Reference" and "Generator" — user asked to merge into one unified flow
- No loading animation/branding while generating
- Generator has limited controls (details hidden in collapsible)

## Changes

### 1. Unified Single Generator (merge tabs)
Replace the two-tab layout with a single creation flow:
- **Step 1**: Essentials always visible (Gender, Age, Ethnicity, Morphology — all promoted to top level)
- **Step 2**: Details section (Eye Color, Hair Style, Hair Color, Skin Tone, Facial Hair, Distinctive Trait) — open by default, not collapsed
- **Optional reference toggle**: A checkbox/switch "Use reference image" that reveals an upload area. When enabled, the reference image is sent alongside the structured description to guide the generation. T&C checkbox appears only when reference is uploaded.
- This eliminates confusion between "reference" vs "generator" modes

### 2. More Generator Controls
Add these new fields to the form:
- **Skin Tone** (Fair, Light, Medium, Olive, Tan, Brown, Dark)
- **Face Shape** (Oval, Round, Square, Heart, Diamond)
- **Expression** (Neutral, Smile, Serious, Confident, Soft)
- **Facial Hair** (only when Male — None, Stubble, Short beard, Full beard, Goatee, Mustache)

### 3. Branded Loading Animation While Generating
Replace the simple spinner with a branded loading state:
- Show 3-4 rotating VOVV.AI branded placeholder model silhouettes/avatars
- Subtle pulse animation with text like "Creating your brand model..." and rotating tips
- Example tips: "Your model will have a clean studio background", "AI is crafting realistic skin texture", "Almost there — finalizing details"

### 4. Improved Prompt Engineering (Edge Function)
Enhance both modes with a more detailed, photorealistic prompt:

**Generator mode prompt upgrade:**
```
"Ultra-realistic professional fashion model studio portrait photograph, shot on Canon EOS R5 with 85mm f/1.4 lens. 
{Gender}, {age} years old, {ethnicity} ethnicity, {morphology} build, {skin_tone} skin tone, {face_shape} face shape.
{eye_color} eyes. {hair_description}. {facial_hair}. {expression} expression. {distinctive}.
Light grey (#E8E8E8) seamless paper studio background.
Soft diffused three-point Profoto lighting setup, subtle catch light in eyes, 
sharp focus on facial features at f/2.8, natural skin texture with visible pores, 
no retouching, no airbrushing, no AI artifacts, no uncanny valley.
Editorial fashion photography, waist-up framing, subject centered,
looking directly at camera. Color-accurate, neutral white balance. 8K resolution."
```

**Reference mode prompt upgrade** — same quality directives but also include:
```
"Generate a model that closely resembles the reference image provided. Match the facial structure, skin tone, and overall appearance."
```

Keep using `google/gemini-3-pro-image-preview` — it's the best available image generation model.

### 5. Edge Function: Accept Combined Mode
Update `generate-user-model` to accept a new `mode: "combined"` where both `description` AND optional `imageUrl` can be provided. The description fields build the prompt; if a reference image is also provided, it's passed as an additional reference to the image generation call.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/BrandModels.tsx` | Replace two tabs with unified generator, add new fields, add branded loading state |
| `supabase/functions/generate-user-model/index.ts` | Enhanced prompts, new combined mode, additional description fields (skinTone, faceShape, expression, facialHair) |

No database or hook changes needed.

