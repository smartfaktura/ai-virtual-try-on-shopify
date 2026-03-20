

# Fix: Winter Theme Overridden by Scene Image Instructions

## Root Cause

In `buildPrompt()` (line 186), when a scene image is provided, the environment block says:

> "Replicate the environment, lighting, backdrop, composition, pose direction..."

This is an absolute instruction — the AI model faithfully reproduces the scene image's environment (e.g., a spring garden) and ignores the softer `SEASONAL DIRECTION` block appended later at line 221. The seasonal direction says "let this mood influence..." but the scene replication says "replicate" — the stronger instruction wins.

## Solution

When a creative drop has a seasonal theme AND a scene image, **modify the environment block** to soften the scene-matching instruction and explicitly allow the theme to override environmental elements. This change only applies when `dropContext` is present (creative drops), leaving all other try-on flows untouched.

## Changes

### File: `supabase/functions/generate-tryon/index.ts` — `buildPrompt()` (~line 185-191)

Add a `dropContext` parameter check. When both scene image AND drop theme exist:

**Current** (line 186):
```
Replicate the environment, lighting, backdrop, composition...
```

**New** (only when `dropContext?.theme` is set):
```
Use the POSE and BODY POSITIONING from [SCENE IMAGE] (stance, angle, framing), 
but REPLACE the environment, lighting, and color grading with the SEASONAL DIRECTION below. 
Do NOT replicate the background from [SCENE IMAGE] — only use it for pose reference.
```

When there's no drop theme, the original "Replicate" instruction stays intact — zero impact on regular try-on generations.

Also move `dropBlocks` injection from the end of the prompt (line 221) to just after the environment block (line 212) so the seasonal direction is closer to the environment instruction and has more weight.

### Summary
- 1 file, ~10 lines changed
- Only affects creative drop try-on jobs with a scene image + seasonal theme
- Regular try-on, freestyle, and workflow generations are completely untouched
- The AI model will use the scene image for pose reference only, applying the winter aesthetic to the environment

