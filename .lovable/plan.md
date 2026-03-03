

## Fix: Workflow Still Generating Wrong Aspect Ratio Despite Selection

### Problem
User selects 1:1 (Square) but gets story/portrait format output. The aspect ratio instruction is appended at the very end of the prompt as `\n\nOutput aspect ratio: 1:1`, which the AI model deprioritizes vs. the tall reference image dimensions.

### Root Cause
The aspect ratio enforcement is too weak — it's a single line appended after the entire prompt. The AI model sees a tall product reference image and defaults to matching its proportions, ignoring the soft instruction at the end.

### Fix — `supabase/functions/generate-workflow/index.ts`

**1. Move aspect ratio to the TOP of the prompt as a hard constraint** (line 548)

Instead of appending `Output aspect ratio: 1:1` at the end, prepend it as a mandatory instruction at the very beginning of the prompt:

```
MANDATORY OUTPUT FORMAT: Generate this image at EXACTLY {ratio} aspect ratio. 
This is a hard constraint — do NOT match the reference image dimensions.
```

**2. Also add it to the CRITICAL REQUIREMENTS section** in `buildVariationPrompt` (lines 506-512)

Add an explicit requirement about output dimensions inside the numbered requirements list that the model already follows, e.g.:
```
The output image MUST be {ratio} aspect ratio. Do NOT inherit the reference image's dimensions.
```

This means the aspect ratio instruction appears in 3 places:
- Top of prompt (prepended in `generateImage`)
- Critical requirements (in `buildVariationPrompt`)  
- `image_config` API parameter (already there)

### Files Changed — 1 file
`supabase/functions/generate-workflow/index.ts`

