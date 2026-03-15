

## Fix: Preserve Source Background/Environment Across All Perspectives

### Problem
The prompts say "the ONLY change is the camera angle" but the environment rules override this by requesting generic "clean, neutral surface" or "curated lifestyle" settings instead of preserving the actual background from the source image. The AI generates new backgrounds for each angle instead of keeping the original one.

### Solution
Update the prompt layers in `src/hooks/useGeneratePerspectives.ts` to explicitly instruct the AI to preserve the exact background/environment from the source image.

#### Changes in `buildPerspectivePrompt` and `getEnvironmentRules`:

1. **System instruction** (lines 226-234): Add explicit environment preservation language to both on-model and product-only modes:
   - *"Preserve the EXACT same background, surface, lighting setup, and environment from [PRODUCT IMAGE]."*

2. **`getEnvironmentRules` function** (lines 172-181): Replace the generic studio/lifestyle descriptions with source-matching instructions:
   - **Non-context angles**: Instead of "Clean, neutral surface (white, light gray...)", say: *"Match the EXACT background, surface, and environment from the source image. Same backdrop color/texture, same surface material, same lighting setup. Do NOT introduce a new background or studio setup."*
   - **Context angles**: Instead of "Place the product in a curated environment", say: *"Maintain the same environmental style and mood from the source image. If the source has a specific setting (street, studio, interior), stay in that same type of environment with consistent materials and tones."*
   - Keep the lighting consistency instructions (5500K, same key-light direction).

3. **Negatives** (lines 187-210): Add a new negative line: *"Do NOT change the background, environment, or surface from the source image"*

### Files changed
| File | Change |
|------|--------|
| `src/hooks/useGeneratePerspectives.ts` | Update system instructions, environment rules, and negatives to enforce source background preservation |

