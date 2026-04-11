

# Tighter Face Framing for Brand Model Generations

## Problem
Current prompts use "waist-up framing" which shows the cami top / t-shirt too prominently. The model generation should focus on the face.

## Changes — `supabase/functions/generate-user-model/index.ts`

### 1. `buildPromptFromDescription` (line 38)
Change `"Editorial fashion photography, waist-up framing, subject centered,"` to:
`"Editorial fashion photography, close-up head-and-shoulders framing, face fills most of frame, subject centered,"`

### 2. Reference mode prompt (line 325)
Change `waist-up framing` to `close-up head-and-shoulders framing, face fills most of frame`

Both changes ensure the AI crops tighter on the face, showing only the very top of the shoulders/clothing rather than the full torso.

