

## Fix: Eliminate All Remaining Bokeh Sources in Natural Selfie Mode

### Root Cause
Three separate prompt layers are still telling the AI to produce bokeh or soft/dreamy aesthetics, contradicting the Natural mode instructions:

1. **Global negative prompt (line 70)**: Says "No blurry areas **unless intentionally bokeh**" -- this gives the AI explicit permission to add bokeh whenever it thinks it's appropriate (like selfies)
2. **Selfie base layer (line 89)**: "Shot on a high-end smartphone front-facing camera" -- AI models strongly associate front-camera selfies with Portrait Mode bokeh
3. **Portrait Quality selfie layer (line 158-160)**: "Soft, flattering natural light" and "Slight warmth and glow" push toward a dreamy, processed look rather than raw iPhone output

### Solution

All changes in one file: `supabase/functions/generate-freestyle/index.ts`

**Change 1: Make the global negative prompt conditional (line 66-72)**

When `cameraStyle === 'natural'`, replace the bokeh-permissive line with a strict version:
- Current: "No blurry or out-of-focus areas unless intentionally bokeh"
- Natural: "No blurry or out-of-focus areas. No bokeh. No shallow depth of field. Everything must be sharp from foreground to background."

This means the negative prompt becomes a function that takes `cameraStyle` instead of a static constant.

**Change 2: Make the selfie base layer conditional (line 86-89)**

When Natural:
- Remove "Shot on a high-end smartphone front-facing camera" (too associated with Portrait Mode)
- Replace with: "Shot on iPhone front camera in standard photo mode (NOT Portrait Mode). No depth-of-field effects."

**Change 3: Make the Portrait Quality selfie layer conditional (line 157-160)**

When Natural, replace the current soft/warm description with:
- "Natural, authentic skin texture with realistic pores and subtle imperfections. Even, ambient lighting on the face — no dramatic light shaping, no artificial warmth or glow. True-to-life skin tones with zero color grading. As captured by a smartphone front camera in auto mode."

When Pro, keep the existing text unchanged.

### Why This Will Work
Currently the AI receives ~5 separate signals encouraging bokeh/softness, and only 2 signals saying "no bokeh." The AI averages these out and still produces moderate bokeh. After this fix, in Natural mode, every single layer consistently says "sharp background, no bokeh, no Portrait Mode" -- there are zero contradicting signals left.

### Technical Details

The `NEGATIVE_PROMPT` constant becomes a function:

```typescript
function buildNegativePrompt(cameraStyle?: 'pro' | 'natural'): string {
  const blurRule = cameraStyle === 'natural'
    ? 'No blurry or out-of-focus areas. No bokeh. No shallow depth of field. Everything must be sharp from foreground to background.'
    : 'No blurry or out-of-focus areas unless intentionally bokeh';
  
  return `
CRITICAL — DO NOT include any of the following:
- No text, watermarks, logos, labels, or signatures anywhere in the image
- No distorted or extra fingers, hands, or limbs
- ${blurRule}
- No AI-looking skin smoothing or plastic textures
- No collage layouts or split-screen compositions`;
}
```

The selfie base layer (line 87-90) becomes conditional:

```typescript
if (isSelfie) {
  layers.push(`Authentic selfie-style photo: ${rawPrompt}`);
  if (cameraStyle === 'natural') {
    layers.push(
      "Ultra high resolution, sharp focus on face, natural ambient lighting, true-to-life color accuracy. Shot on iPhone front camera in standard photo mode (NOT Portrait Mode). No depth-of-field blur applied."
    );
  } else {
    layers.push(
      "Ultra high resolution, sharp focus on face, natural ambient lighting, true-to-life color accuracy. Shot on a high-end smartphone front-facing camera."
    );
  }
```

The Portrait Quality selfie layer (line 157-160) becomes conditional:

```typescript
if (isSelfie) {
  if (cameraStyle === 'natural') {
    layers.push(
      "PORTRAIT QUALITY (SELFIE): Natural, authentic skin texture with realistic pores and subtle imperfections. Even, ambient lighting on the face — no dramatic light shaping, no artificial warmth or glow. True-to-life skin tones with zero color grading. As captured by a smartphone front camera in auto mode."
    );
  } else {
    layers.push(
      "PORTRAIT QUALITY (SELFIE): Natural, authentic skin texture with realistic pores and subtle imperfections — NOT studio-retouched or airbrushed. Soft, flattering natural light on the face. Relaxed, genuine expression as if casually taking a selfie. Slight warmth and glow from ambient or window light."
    );
  }
```

All references to `NEGATIVE_PROMPT` constant will be replaced with `buildNegativePrompt(cameraStyle)` calls (need to pass `cameraStyle` through to wherever the negative prompt is assembled).

